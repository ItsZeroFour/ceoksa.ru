import axios from "axios";
import User from "../models/User.js";
import { getRimToken } from "../utils/mtsRimToken.js";

const RIM_BASE_URL = "https://api.mts.ru/rim/2.0/api/v2";
const RIM_FILE_PROXY_URL = "https://rim.idscan.mts.ru/api/v2/fileproxy";

const rimRequest = async (method, path, data = null) => {
  const token = await getRimToken();
  const config = {
    method,
    url: `${RIM_BASE_URL}${path}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  if (data) config.data = data;
  return axios(config);
};

const generateExternalId = (userId) => {
  return `oksa_${userId}`;
};

export const startVerification = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    const externalId = generateExternalId(userId);

    const passport = user.passport || {};
    const rawSN = String(passport.series_number || "").replace(/\s/g, "");
    const series = rawSN.slice(0, 4);
    const number = rawSN.slice(4);

    const nameParts = (user.fullName || "").trim().split(/\s+/);
    const surname = nameParts[0] || "";
    const firstName = nameParts[1] || "";
    const middleName = nameParts[2] || "";

    const formatDateToISO = (dateStr) => {
      if (!dateStr) return null;
      if (dateStr.includes("-") && dateStr.length === 10) return dateStr;
      const parts = dateStr.split(".");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return null;
    };

    const applicantData = {
      externalId,
      email: user.email || undefined,
      phone: user.phone
        ? String(user.phone).replace(/\D/g, "").slice(0, 11)
        : undefined,
      firstName: firstName || undefined,
      surname: surname || undefined,
      middleName: middleName || undefined,
      birthdate: formatDateToISO(passport.birth) || undefined,
      passport:
        series && number
          ? {
              series,
              number,
              issuedDate: formatDateToISO(passport.date) || undefined,
              issuedBy: passport.issued_by || undefined,
              divisionCode: passport.department_code
                ? passport.department_code.replace("-", "")
                : undefined,
            }
          : undefined,
      registrationAddress: user.address?.street
        ? {
            city: user.address.street,
          }
        : undefined,
    };

    const cleanApplicantData = JSON.parse(JSON.stringify(applicantData));

    try {
      await rimRequest("POST", `/applicants`, cleanApplicantData);
      console.log(`[RIM] Заявитель создан/обновлён: ${externalId}`);
    } catch (applicantError) {
      if (applicantError.response?.status !== 202) {
        console.error(
          "[RIM] Ошибка создания заявителя:",
          applicantError.response?.data || applicantError.message
        );
        try {
          await rimRequest(
            "PUT",
            `/applicants/${externalId}`,
            cleanApplicantData
          );
          console.log(`[RIM] Заявитель обновлён: ${externalId}`);
        } catch (updateError) {
          console.error(
            "[RIM] Ошибка обновления заявителя:",
            updateError.response?.data || updateError.message
          );
        }
      }
    }

    const callbackUrl = process.env.RIM_CALLBACK_URL || null;
    const redirectUrl =
      process.env.RIM_REDIRECT_URL ||
      `${
        process.env.BASE_URL || "https://ceoksa.ru"
      }/account/loan_applications`;

    const identificationData = {
      linkLifetimeInMinutes: 460,
      redirectUrl,
      workflowPreferences: {
        smsNotification: {
          isActive: false,
        },
        manualInput: {
          isActive: false,
        },
        mobileId: {
          isActive: false,
        },
        bio: {
          isActive: true,
          allowedDocuments: ["rus.passport"],
          steps: ["document", "documentForm", "selfie", "successPage"],
          deepfakeCheck: true,
          lastSelfieMatching: false,
        },
        verification: {
          isActive: false,
        },
        inn: {
          isActive: false,
        },
        rfm: {
          isActive: false,
        },
      },
    };

    const identResponse = await rimRequest(
      "POST",
      `/applicants/${externalId}/identifications`,
      identificationData
    );

    const {
      id: requestGuid,
      identificationUrl,
      registeredAt,
    } = identResponse.data;

    await User.findByIdAndUpdate(userId, {
      $set: {
        "rim.applicantExternalId": externalId,
        "rim.lastRequestGuid": requestGuid,
        "rim.identificationUrl": identificationUrl,
        "rim.identificationStatus": "linkCreated",
        "rim.startedAt": registeredAt || new Date().toISOString(),
      },
    });

    console.log(
      `[RIM] Идентификация создана. User: ${userId}, RequestGuid: ${requestGuid}`
    );

    res.json({
      success: true,
      identificationUrl,
      requestGuid,
    });
  } catch (error) {
    console.error(
      "[RIM] Ошибка startVerification:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Ошибка при запуске верификации",
      details: error.response?.data,
    });
  }
};

export const getIdentificationStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Пользователь не найден" });
    }

    if (!user.rim?.applicantExternalId || !user.rim?.lastRequestGuid) {
      return res.status(400).json({
        success: false,
        message: "Идентификация не была запущена",
      });
    }

    const { applicantExternalId, lastRequestGuid } = user.rim;

    const response = await rimRequest(
      "GET",
      `/applicants/${applicantExternalId}/identifications/${lastRequestGuid}`
    );

    const data = response.data;
    const status = data.identification?.status;

    await User.findByIdAndUpdate(userId, {
      $set: {
        "rim.identificationStatus": status,
      },
    });

    res.json({
      success: true,
      status,
      statusReasons: data.identification?.statusReasons || [],
      errors: data.identification?.errors || [],
      data,
    });
  } catch (error) {
    console.error(
      "[RIM] Ошибка getIdentificationStatus:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      success: false,
      message: "Ошибка получения статуса идентификации",
    });
  }
};

export const completeIdentification = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Пользователь не найден" });
    }

    if (!user.rim?.applicantExternalId || !user.rim?.lastRequestGuid) {
      return res.status(400).json({
        success: false,
        message: "Идентификация не была запущена",
      });
    }

    const { applicantExternalId, lastRequestGuid } = user.rim;

    const response = await rimRequest(
      "GET",
      `/applicants/${applicantExternalId}/identifications/${lastRequestGuid}`
    );

    const data = response.data;
    const identification = data.identification || {};
    const workflowData = data.workflowData || {};
    const personalData = workflowData.personalData || {};
    const optionalChecks = workflowData.optionalChecks || {};

    const status = identification.status;

    const updateFields = {
      "rim.identificationStatus": status,
      "rim.completedAt": new Date().toISOString(),
      "rim.rawResult": data,
    };

    if (
      status === "identificationSucceeded" ||
      status === "personDataCollected"
    ) {
      const doc = personalData.documents?.[0] || personalData.passport || {};

      const recognizedSeries = doc.series || "";
      const recognizedNumber = doc.number || "";
      const seriesNumber =
        recognizedSeries && recognizedNumber
          ? `${recognizedSeries} ${recognizedNumber}`
          : recognizedSeries || recognizedNumber || "";

      const fullName = [
        doc.surname || personalData.surname || "",
        doc.firstName || personalData.firstName || "",
        doc.middleName || personalData.middleName || "",
      ]
        .filter(Boolean)
        .join(" ");

      const formatDateFromISO = (isoDate) => {
        if (!isoDate) return "";
        if (isoDate.includes(".") && !isoDate.includes("-")) return isoDate;
        const parts = isoDate.split("-");
        if (parts.length === 3) {
          return `${parts[2]}.${parts[1]}.${parts[0]}`;
        }
        return isoDate;
      };

      const mapSex = (sex) => {
        if (!sex) return "";
        if (sex === "male") return "Мужской";
        if (sex === "female") return "Женский";
        return sex;
      };

      if (fullName) updateFields.fullName = fullName;

      if (seriesNumber) updateFields["passport.series_number"] = seriesNumber;

      const issuedDate = doc.issuedDate || "";
      if (issuedDate)
        updateFields["passport.date"] = formatDateFromISO(issuedDate);

      const issuedBy = doc.issuedBy || doc.authority || "";
      if (issuedBy) updateFields["passport.issued_by"] = issuedBy;

      const divisionCode = doc.divisionCode || doc.authorityCode || "";
      if (divisionCode) updateFields["passport.department_code"] = divisionCode;

      const birthDate = doc.birthdate || personalData.birthdate || "";
      if (birthDate)
        updateFields["passport.birth"] = formatDateFromISO(birthDate);

      const birthPlace = doc.birthplace || personalData.birthplace || "";
      if (birthPlace) updateFields["passport.place_of_birth"] = birthPlace;

      const gender = mapSex(doc.sex || personalData.sex || "");
      if (gender) updateFields["passport.gender"] = gender;

      if (personalData.selfiePhotoKey) {
        updateFields["rim.selfiePhotoKey"] = personalData.selfiePhotoKey;
      }
      if (personalData.passport?.photoKey) {
        updateFields["rim.passportPhotoKey"] = personalData.passport.photoKey;
      }
      if (personalData.registrationAddress?.photoKey) {
        updateFields["rim.registrationPhotoKey"] =
          personalData.registrationAddress.photoKey;
      }

      const regAddr = personalData.registrationAddress;
      if (regAddr) {
        const addressParts = [
          regAddr.region,
          regAddr.city,
          regAddr.street,
          regAddr.house ? `д. ${regAddr.house}` : null,
          regAddr.houseBuilding ? `стр. ${regAddr.houseBuilding}` : null,
          regAddr.flat ? `кв. ${regAddr.flat}` : null,
        ].filter(Boolean);

        if (addressParts.length > 0) {
          updateFields["address.street"] =
            regAddr.summary || addressParts.join(", ");
        }
      }

      if (optionalChecks.inn?.inn) {
        updateFields["rim.inn"] = optionalChecks.inn.inn;
      }
      if (optionalChecks.verification !== undefined) {
        updateFields["rim.isVerified"] =
          optionalChecks.verification?.isVerified;
      }
      if (optionalChecks.rfm !== undefined) {
        updateFields["rim.rfmFound"] = optionalChecks.rfm?.isFound;
      }

      if (data.consents) {
        updateFields["rim.consents"] = data.consents;
      }
    }

    await User.findByIdAndUpdate(userId, { $set: updateFields });

    console.log(
      `[RIM] Идентификация завершена. User: ${userId}, Status: ${status}`
    );

    res.json({
      success: true,
      status,
      statusReasons: identification.statusReasons || [],
      isSucceeded: status === "identificationSucceeded",
      personalData:
        status === "identificationSucceeded"
          ? {
              fullName: updateFields.fullName,
              passport: {
                seriesNumber: updateFields["passport.series_number"],
                date: updateFields["passport.date"],
                issuedBy: updateFields["passport.issued_by"],
                departmentCode: updateFields["passport.department_code"],
                birth: updateFields["passport.birth"],
                placeOfBirth: updateFields["passport.place_of_birth"],
                gender: updateFields["passport.gender"],
              },
            }
          : null,
    });
  } catch (error) {
    console.error(
      "[RIM] Ошибка completeIdentification:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      success: false,
      message: "Ошибка завершения идентификации",
    });
  }
};

export const handleRimCallback = async (req, res) => {
  try {
    const { requestId, status } = req.body;

    console.log(`[RIM Callback] requestId: ${requestId}, status: ${status}`);

    if (!requestId) {
      return res.status(400).json({ error: "requestId is required" });
    }

    const user = await User.findOne({ "rim.lastRequestGuid": requestId });

    if (user) {
      await User.findByIdAndUpdate(user._id, {
        $set: {
          "rim.identificationStatus":
            status === "completed" ? "completed" : status,
          "rim.callbackReceivedAt": new Date().toISOString(),
        },
      });
      console.log(
        `[RIM Callback] Статус обновлён для пользователя: ${user._id}`
      );
    } else {
      console.warn(
        `[RIM Callback] Пользователь не найден для requestId: ${requestId}`
      );
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[RIM Callback] Ошибка:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCurrentIdentification = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Пользователь не найден" });
    }

    if (!user.rim?.lastRequestGuid) {
      return res.json({
        success: true,
        hasIdentification: false,
      });
    }

    res.json({
      success: true,
      hasIdentification: true,
      identificationUrl: user.rim.identificationUrl,
      status: user.rim.identificationStatus,
      requestGuid: user.rim.lastRequestGuid,
    });
  } catch (error) {
    console.error("[RIM] Ошибка getCurrentIdentification:", error.message);
    res.status(500).json({ success: false, message: "Внутренняя ошибка" });
  }
};

export const getRimPhoto = async (req, res) => {
  try {
    const objectName = Array.isArray(req.params.objectName)
      ? req.params.objectName.join("/")
      : req.params.objectName || req.params[0];
    const token = await getRimToken();

    const response = await axios.get(`${RIM_FILE_PROXY_URL}/${objectName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "dc-application-id": process.env.MTS_RIM_CLIENT_ID,
      },
      responseType: "arraybuffer",
    });

    const contentType = response.headers["content-type"] || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.send(response.data);
  } catch (error) {
    console.error("[RIM] Ошибка getRimPhoto:", error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: "Ошибка получения фото",
    });
  }
};
