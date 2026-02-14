import express from 'express';

const router = express.Router();

const DADATA_API_KEY = process.env.DADATA_API_KEY;
const DADATA_SECRET_KEY = process.env.DADATA_SECRET_KEY;

router.post('/validate-bic', async (req, res) => {
  try {
    const { bic } = req.body;

    if (!bic) {
      return res.status(400).json({
        success: false,
        message: 'БИК не указан',
      });
    }

    if (!/^\d{9}$/.test(bic)) {
      return res.status(400).json({
        success: false,
        message: 'БИК должен содержать 9 цифр',
      });
    }

    // Запрос к Dadata API
    const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/bank', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${DADATA_API_KEY}`,
      },
      body: JSON.stringify({
        query: bic,
      }),
    });

    if (!response.ok) {
      console.error('Dadata API error:', response.status, response.statusText);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при обращении к API проверки банков',
      });
    }

    const data = await response.json();

    if (!data.suggestions || data.suggestions.length === 0) {
      return res.json({
        success: false,
        bank: null,
        message: 'Банк с указанным БИК не найден',
      });
    }

    const bankInfo = data.suggestions[0];
    
    const bankData = {
      bic: bankInfo.data.bic,
      name: bankInfo.data.name?.payment || bankInfo.value,
      correspondent_account: bankInfo.data.correspondent_account,
      inn: bankInfo.data.inn,
      kpp: bankInfo.data.kpp,
      registration_number: bankInfo.data.registration_number,
      swift: bankInfo.data.swift,
      address: bankInfo.data.address?.unrestricted_value,
      state: bankInfo.data.state?.status,
    };

    if (bankData.state && bankData.state !== 'ACTIVE') {
      return res.json({
        success: false,
        bank: bankData,
        message: `Банк "${bankData.name}" не активен (статус: ${bankData.state})`,
      });
    }

    return res.json({
      success: true,
      bank: bankData,
      message: 'Банк успешно найден',
    });

  } catch (error) {
    console.error('Error validating BIC:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера при проверке БИК',
    });
  }
});

export default router;