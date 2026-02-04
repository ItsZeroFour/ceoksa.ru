import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Получение публичного ключа из JWKS в формате PEM
const getPublicKeyFromJwks = () => {
  try {
    const jwksPath = path.join(__dirname, '../jwks.json');
    const jwks = JSON.parse(fs.readFileSync(jwksPath, 'utf8'));
    const key = jwks.keys.find(key => key.use === 'sig');
    
    if (!key) {
      throw new Error('No signing key found in JWKS');
    }
    
    // Преобразуем JWKS ключ в формат PEM
    const pem = jwkToPem(key);
    console.log('✅ Public key converted to PEM format');
    
    return pem;
  } catch (err) {
    console.error('❌ Error reading JWKS file:', err.message);
    return null;
  }
};

// Валидация формата JWT
const isValidJwtFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  return parts.every(part => {
    return /^[A-Za-z0-9\-_]+$/.test(part) && part.length > 0;
  });
};

// Обработка уведомлений от Мобильного ID
export const handleNotification = (req, res) => {
  const {
    auth_req_id,
    id_token,
    access_token,
    token_type,
    expires_in,
    jwks_uri,
    correlation_id,
    error,
    error_description
  } = req.body;

  console.log('=== 📱 Notification received ===');
  console.log('Headers:', {
    'X-Mobileid-Request-Id': req.headers['x-mobileid-request-id'],
    'X-Mobileid-Transaction-Id': req.headers['x-mobileid-transaction-id']
  });

  // Проверка обязательного параметра
  if (!auth_req_id) {
    console.error('❌ Missing auth_req_id');
    return res.status(400).json({
      error: 'Missing required parameter',
      details: 'auth_req_id is required'
    });
  }

  // Обработка негативного сценария
  if (error) {
    console.warn('⚠️ Authentication failed:', {
      auth_req_id,
      correlation_id,
      error,
      error_description
    });
    return res.status(204).end();
  }

  // Проверка наличия id_token
  if (!id_token) {
    console.error('❌ Missing id_token');
    return res.status(400).json({
      error: 'Missing required parameter',
      details: 'id_token is required for successful authentication'
    });
  }

  // Валидация формата JWT
  if (!isValidJwtFormat(id_token)) {
    console.error('❌ Invalid JWT format');
    return res.status(400).json({
      error: 'Invalid token format',
      details: 'JWT must have 3 parts separated by dots'
    });
  }

  const publicKey = getPublicKeyFromJwks();
  if (!publicKey) {
    console.error('❌ Public key not found');
    return res.status(500).json({
      error: 'Public key not found'
    });
  }

  try {
    // Декодируем заголовок для проверки kid
    const headerBase64 = id_token.split('.')[0];
    const header = JSON.parse(Buffer.from(headerBase64, 'base64url').toString('utf8'));
    console.log('Token header:', header);

    // Проверка алгоритма
    if (header.alg !== 'RS256') {
      console.error('❌ Invalid algorithm:', header.alg);
      return res.status(400).json({
        error: 'Invalid token algorithm',
        details: `Expected RS256, got ${header.alg}`
      });
    }

    // Проверка подписи с использованием PEM ключа
    const decoded = jwt.verify(id_token, publicKey, {
      algorithms: ['RS256']
    });

    console.log('✅ Authentication successful!');
    console.log('Decoded token:', {
      iss: decoded.iss,
      sub: decoded.sub,
      aud: decoded.aud,
      exp: decoded.exp,
      iat: decoded.iat
    });

    // Здесь можно сохранить данные в БД
    // saveSuccessfulAuth({ ... });

    return res.status(204).end();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    console.error('Error details:', err);
    
    return res.status(401).json({
      error: 'Invalid token',
      details: err.message,
      code: err.name
    });
  }
};

// Обработка SMS OTP уведомлений
export const handleSmsOtp = (req, res) => {
  const { auth_req_id, smsotp_endpoint, send, correlation_id } = req.body;
  
  if (!auth_req_id || !smsotp_endpoint || !send) {
    return res.status(400).json({ 
      error: 'Missing required parameters', 
      details: 'auth_req_id, smsotp_endpoint and send are required' 
    });
  }

  console.log('📱 SMS OTP notification received:', {
    auth_req_id,
    smsotp_endpoint,
    verify_code_placeholder: send.verify_code,
    correlation_id,
    timestamp: new Date().toISOString()
  });

  return res.status(200).end();
};

// Получение JWKS
export const getJwks = (req, res) => {
  try {
    const jwksPath = path.join(__dirname, '../jwks.json');
    const jwks = fs.readFileSync(jwksPath, 'utf8');
    
    res.setHeader('Content-Type', 'application/json');
    res.send(jwks);
  } catch (err) {
    console.error('Error reading JWKS file:', err);
    res.status(500).json({ error: 'Failed to load JWKS' });
  }
};