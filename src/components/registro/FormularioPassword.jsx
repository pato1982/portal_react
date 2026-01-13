import React from 'react';
import PasswordInput from './PasswordInput';

function FormularioPassword({
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
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

export default FormularioPassword;
