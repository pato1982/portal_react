import React from 'react';
import PasswordInput from './PasswordInput';

function FormularioCodigoPassword({
  codigoPortal,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  onCodigoChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  datosAutoLlenado,
  onAutoLlenar
}) {
  return (
    <>
      {datosAutoLlenado && (
        <button type="button" className="btn-autollenar" onClick={onAutoLlenar}>
          Auto-llenar (Demo)
        </button>
      )}
      <div className="form-group">
        <label htmlFor="codigoPortal">Codigo dado por Portal Estudiantil *</label>
        <input
          type="text"
          id="codigoPortal"
          value={codigoPortal}
          onChange={onCodigoChange}
          placeholder="Ingrese el codigo"
          style={{ textTransform: 'uppercase' }}
        />
      </div>
      <div className="password-info">
        <p>La contrasena debe tener:</p>
        <ul>
          <li>Al menos 6 caracteres</li>
          <li>Al menos una letra mayuscula</li>
        </ul>
      </div>
      <div className="form-row">
        <PasswordInput
          id="password"
          label="Contrasena *"
          value={password}
          onChange={onPasswordChange}
          placeholder="Ingrese contrasena"
          showPassword={showPassword}
          onToggleShow={onTogglePassword}
        />
        <PasswordInput
          id="confirmPassword"
          label="Confirmar contrasena *"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          placeholder="Confirme contrasena"
          showPassword={showConfirmPassword}
          onToggleShow={onToggleConfirmPassword}
        />
      </div>
    </>
  );
}

export default FormularioCodigoPassword;
