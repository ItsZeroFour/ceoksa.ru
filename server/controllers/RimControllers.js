import axios from "axios";
import User from "../models/User.js";
import { getRimToken } from "../utils/mtsRimToken.js";

const RIM_BASE_URL = "https://api.mts.ru/rim/2.0/api/v2";
const DC_APPLICATION_ID = "e11abd8c-b8f5-44de-8820-84b7ff602711";
const FILE_PROXY_URLS = [
  "https://rim.idscan.mts.ru/api/v2/fileproxy",
  "https://api.mts.ru/rim/2.0/api/v2/fileproxy",
];

const DATA_READY_STATUSES = [
  "identificationSucceeded",
  "personDataCollected",
  "completed",
];
const FAILURE_STATUSES = ["identificationFailed", "systemError"];

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

const generateExternalId = (userId) => `oksa_${userId}`;

const pullRimPersonalData = async (user) => {
  const { applicantExternalId, lastRequestGuid } = user.rim;

  console.log(
    `[RIM pullData] Запрос к API. externalId: ${applicantExternalId}, guid: ${lastRequestGuid}`
  );

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

  console.log(`[RIM pullData] Статус из API: "${status}". User: ${user._id}`);

  const canExtractData = DATA_READY_STATUSES.includes(status);
  const isFailed = FAILURE_STATUSES.includes(status);

  if (!canExtractData && !isFailed) {
    console.log(`[RIM pullData] Статус "${status}" не финальный. Пропускаем.`);
    return { status, saved: false };
  }

  if (isFailed) {
    console.log(`[RIM pullData] Провал: "${status}".`);
    await User.findByIdAndUpdate(user._id, {
      $set: { "rim.identificationStatus": status },
    });
    return { status, saved: true };
  }

  if (user.rim?.identificationStatus === "identificationSucceeded") {
    return { status: "identificationSucceeded", saved: false };
  }

  console.log(`[RIM pullData] Данные готовы (${status}). Извлекаем...`);

  const updateFields = {
    "rim.identificationStatus": "identificationSucceeded",
    "rim.completedAt": new Date().toISOString(),
    "rim.rawResult": data,
  };

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
    if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
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
  if (issuedDate) updateFields["passport.date"] = formatDateFromISO(issuedDate);

  const issuedBy = doc.issuedBy || doc.authority || "";
  if (issuedBy) updateFields["passport.issued_by"] = issuedBy;

  const divisionCode = doc.divisionCode || doc.authorityCode || "";
  if (divisionCode) updateFields["passport.department_code"] = divisionCode;

  const birthDate = doc.birthdate || personalData.birthdate || "";
  if (birthDate) updateFields["passport.birth"] = formatDateFromISO(birthDate);

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

  const regAddr = personalData.registrationAddress;
  if (regAddr) {
    const addressParts = [
      regAddr.postalCode,
      regAddr.region,
      regAddr.district,
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
    if (regAddr.flat) updateFields["address.apartment"] = regAddr.flat;
    if (regAddr.registrationDate) {
      updateFields["address.registration_date"] = formatDateFromISO(
        regAddr.registrationDate
      );
    }
    if (regAddr.photoKey) {
      updateFields["rim.registrationPhotoKey"] = regAddr.photoKey;
      updateFields["photos.page_with_registration_stamp"] = regAddr.photoKey;
    }
  }

  if (optionalChecks.inn?.inn) {
    updateFields["rim.inn"] = optionalChecks.inn.inn;
    updateFields["inn"] = optionalChecks.inn.inn;
  }
  if (optionalChecks.verification !== undefined) {
    updateFields["rim.isVerified"] = optionalChecks.verification?.isVerified;
  }

  if (data.consents) {
    updateFields["rim.consents"] = data.consents;
  }

  console.log(
    `[RIM pullData] Сохраняем. fullName: "${fullName}", passport: "${seriesNumber}"`
  );

  await User.findByIdAndUpdate(user._id, { $set: updateFields });

  return { status: "identificationSucceeded", saved: true };
};

export const startVerification = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Пользователь не найден" });
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
      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
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
        ? { city: user.address.street }
        : undefined,
    };

    const cleanApplicantData = JSON.parse(JSON.stringify(applicantData));

    try {
      await rimRequest("POST", `/applicants`, cleanApplicantData);
    } catch (applicantError) {
      if (applicantError.response?.status !== 202) {
        try {
          await rimRequest(
            "PUT",
            `/applicants/${externalId}`,
            cleanApplicantData
          );
        } catch (updateError) {
          console.error(
            "[RIM] Ошибка обновления заявителя:",
            updateError.response?.data || updateError.message
          );
        }
      }
    }

    const redirectUrl =
      process.env.RIM_REDIRECT_URL ||
      `${
        process.env.BASE_URL || "https://ceoksa.ru"
      }/account/loan_applications`;

    const identificationData = {
      linkLifetimeInMinutes: 460,
      redirectUrl,
      workflowPreferences: {
        smsNotification: { isActive: false },
        manualInput: { isActive: false },
        mobileId: { isActive: false },
        bio: {
          isActive: true,
          allowedDocuments: ["rus.passport"],
          steps: [
            "selfie",
            "document",
            "documentForm",
            "registration",
            "address",
            "successPage",
          ],
          deepfakeCheck: true,
          lastSelfieMatching: false,
        },
        verification: { isActive: false },
        inn: { isActive: true },
        rfm: { isActive: false },
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
        "rim.completedAt": null,
        "rim.rawResult": null,
      },
    });

    console.log(
      `[RIM] Идентификация создана. User: ${userId}, Guid: ${requestGuid}`
    );

    res.json({ success: true, identificationUrl, requestGuid });
  } catch (error) {
    console.error(
      "[RIM] Ошибка startVerification:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      success: false,
      message:
        error.response?.data?.message || "Ошибка при запуске верификации",
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

    if (user.rim?.identificationStatus === "identificationSucceeded") {
      console.log(
        `[RIM complete] User: ${userId} -- уже identificationSucceeded`
      );
      return res.json({
        success: true,
        status: "identificationSucceeded",
        isSucceeded: true,
      });
    }

    if (FAILURE_STATUSES.includes(user.rim?.identificationStatus)) {
      console.log(
        `[RIM complete] User: ${userId} -- уже ${user.rim.identificationStatus}`
      );
      return res.json({
        success: true,
        status: user.rim.identificationStatus,
        isSucceeded: false,
      });
    }

    if (!user.rim?.applicantExternalId || !user.rim?.lastRequestGuid) {
      return res
        .status(400)
        .json({ success: false, message: "Идентификация не была запущена" });
    }

    console.log(
      `[RIM complete] User: ${userId}. БД статус: "${user.rim.identificationStatus}". Запрос к RIM API...`
    );

    const result = await pullRimPersonalData(user);

    const isSucceeded = result.status === "identificationSucceeded";
    const isFailed = FAILURE_STATUSES.includes(result.status);
    const isPending = !isSucceeded && !isFailed;
    const responseStatus = isPending ? "pending" : result.status;

    console.log(
      `[RIM complete] User: ${userId}. Результат: status="${responseStatus}", saved=${result.saved}`
    );

    res.json({ success: true, status: responseStatus, isSucceeded });
  } catch (error) {
    console.error(`[RIM complete] ОШИБКА:`, {
      message: error.message,
      responseStatus: error.response?.status,
      responseData: error.response?.data,
    });
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

    if (!user) {
      console.warn(
        `[RIM Callback] Пользователь не найден для requestId: ${requestId}`
      );
      return res.status(200).json({ received: true });
    }

    await User.findByIdAndUpdate(user._id, {
      $set: { "rim.callbackReceivedAt": new Date().toISOString() },
    });

    if (
      status === "completed" ||
      status === "identificationSucceeded" ||
      status === "personDataCollected"
    ) {
      try {
        const result = await pullRimPersonalData(user);
        console.log(
          `[RIM Callback] Данные подтянуты. User: ${user._id}, Status: ${result.status}`
        );
      } catch (pullError) {
        console.error(`[RIM Callback] Ошибка:`, pullError.message);
      }
    }

    if (FAILURE_STATUSES.includes(status)) {
      await User.findByIdAndUpdate(user._id, {
        $set: { "rim.identificationStatus": status },
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[RIM Callback] Ошибка:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCurrentIdentification = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res.status(404).json({ success: false, message: "Не найден" });

    if (!user.rim?.lastRequestGuid) {
      return res.json({ success: true, hasIdentification: false });
    }

    res.json({
      success: true,
      hasIdentification: true,
      identificationUrl: user.rim.identificationUrl,
      status: user.rim.identificationStatus,
      requestGuid: user.rim.lastRequestGuid,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Внутренняя ошибка" });
  }
};

export const getIdentificationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user?.rim?.lastRequestGuid) {
      return res
        .status(400)
        .json({ success: false, message: "Нет идентификации" });
    }
    res.json({ success: true, status: user.rim.identificationStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: "Ошибка" });
  }
};

export const getRimPhoto = async (req, res) => {
  try {
    const raw = req.params.objectName || req.params[0];
    const objectName = Array.isArray(raw) ? raw.join("/") : raw;
    if (!objectName)
      return res
        .status(400)
        .json({ success: false, message: "objectName не указан" });

    const token = await getRimToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      "dc-application-id": DC_APPLICATION_ID,
    };

    let lastError = null;
    for (const baseUrl of FILE_PROXY_URLS) {
      try {
        const response = await axios.get(`${baseUrl}/${objectName}`, {
          headers,
          responseType: "arraybuffer",
          timeout: 15000,
        });
        res.setHeader(
          "Content-Type",
          response.headers["content-type"] || "image/jpeg"
        );
        res.setHeader("Cache-Control", "private, max-age=3600");
        return res.send(response.data);
      } catch (err) {
        lastError = err;
      }
    }

    res
      .status(lastError?.response?.status || 500)
      .json({ success: false, message: "Фото не найдено" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Ошибка получения фото" });
  }
};
