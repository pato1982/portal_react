import React from 'react';

function ModalTerminos({ activo, onCerrar }) {
  return (
    <div
      className={`modal-footer-overlay ${activo ? 'active' : ''}`}
      onClick={onCerrar}
    >
      <div className="modal-footer-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="modal-footer-header">
          <h2>Terminos y Condiciones de Uso</h2>
          <button className="modal-footer-cerrar" onClick={onCerrar}>&times;</button>
        </div>
        <div className="modal-footer-body">
          <h3>1. Aceptacion de los Terminos</h3>
          <p>Al acceder y utilizar Portal Estudiantil, usted acepta estar sujeto a estos Terminos y Condiciones de Uso y todas las leyes y regulaciones aplicables. Usted acepta que es responsable del cumplimiento de las leyes locales aplicables. Si no esta de acuerdo con alguno de estos terminos, tiene prohibido usar o acceder a este sitio.</p>

          <h3>2. Definiciones</h3>
          <ul>
            <li><strong>Plataforma:</strong> Sistema de Gestion Academica Portal Estudiantil.</li>
            <li><strong>Usuario:</strong> Toda persona que acceda y utilice la plataforma, incluyendo apoderados, docentes y administradores.</li>
            <li><strong>Establecimiento:</strong> Institucion educacional que utiliza los servicios de la plataforma.</li>
            <li><strong>Contenido:</strong> Toda informacion, datos, textos y materiales disponibles en la plataforma.</li>
          </ul>

          <h3>3. Uso de la Plataforma</h3>
          <p>El usuario se compromete a:</p>
          <ul>
            <li>Utilizar la plataforma unicamente para los fines educativos y administrativos para los que fue disenada.</li>
            <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
            <li>No compartir su cuenta con terceros.</li>
            <li>Proporcionar informacion veraz y actualizada.</li>
            <li>No intentar acceder a informacion de otros usuarios sin autorizacion.</li>
            <li>No utilizar la plataforma para actividades ilegales o no autorizadas.</li>
          </ul>

          <h3>4. Registro y Cuentas de Usuario</h3>
          <p>Para acceder a la plataforma, los usuarios deben registrarse proporcionando informacion personal valida. El usuario es responsable de mantener la confidencialidad de su contrasena y de todas las actividades que ocurran bajo su cuenta. Debe notificar inmediatamente cualquier uso no autorizado de su cuenta.</p>

          <h3>5. Propiedad Intelectual</h3>
          <p>Todos los contenidos de la plataforma, incluyendo pero no limitado a textos, graficos, logotipos, iconos, imagenes, clips de audio, descargas digitales y compilaciones de datos, son propiedad de Portal Estudiantil o sus proveedores de contenido y estan protegidos por las leyes chilenas e internacionales de propiedad intelectual, conforme a la <strong>Ley N 17.336</strong> sobre Propiedad Intelectual.</p>

          <h3>6. Proteccion de Datos</h3>
          <p>El tratamiento de datos personales se realiza conforme a nuestra Politica de Privacidad y en cumplimiento de la <strong>Ley N 19.628</strong> sobre Proteccion de la Vida Privada y la <strong>Ley N 21.719</strong> que moderniza el marco de proteccion de datos personales en Chile.</p>

          <h3>7. Responsabilidades del Usuario</h3>
          <p>El usuario sera responsable de:</p>
          <ul>
            <li>El uso adecuado de la plataforma conforme a estos terminos.</li>
            <li>La veracidad de la informacion proporcionada.</li>
            <li>Los danos y perjuicios que pudiera causar por el uso indebido de la plataforma.</li>
            <li>Mantener actualizada su informacion de contacto.</li>
          </ul>

          <h3>8. Limitacion de Responsabilidad</h3>
          <p>Portal Estudiantil no sera responsable por:</p>
          <ul>
            <li>Interrupciones del servicio por mantenimiento o causas de fuerza mayor.</li>
            <li>Perdida de datos debido a fallos tecnicos ajenos a nuestro control.</li>
            <li>El uso indebido de la plataforma por parte de los usuarios.</li>
            <li>Contenidos publicados por los usuarios que contravengan estos terminos.</li>
          </ul>

          <h3>9. Modificaciones del Servicio</h3>
          <p>Portal Estudiantil se reserva el derecho de modificar, suspender o discontinuar, temporal o permanentemente, el servicio o cualquier parte del mismo, con o sin previo aviso. No seremos responsables ante usted ni ante terceros por cualquier modificacion, suspension o interrupcion del servicio.</p>

          <h3>10. Modificaciones de los Terminos</h3>
          <p>Nos reservamos el derecho de actualizar estos Terminos y Condiciones en cualquier momento. Cuando se realicen modificaciones, los usuarios seran notificados a traves de la plataforma o mediante correo electronico. Las modificaciones entraran en vigor a partir de su publicacion. El uso continuado de la plataforma despues de recibir dicha notificacion se entendera como la aceptacion de los nuevos terminos por parte del usuario.</p>

          <h3>11. Legislacion Aplicable</h3>
          <p>Estos Terminos y Condiciones se regiran e interpretaran de acuerdo con las leyes de la Republica de Chile. Cualquier disputa que surja en relacion con estos terminos sera sometida a la jurisdiccion de los tribunales ordinarios de justicia de Chile.</p>

          <h3>12. Contacto</h3>
          <p>Para cualquier consulta relacionada con estos Terminos y Condiciones, puede contactarnos a traves de: <strong>contacto.portalestudiantil@gmail.com</strong></p>
        </div>
        <div className="modal-footer-pie">
          <p>Ultima actualizacion: Noviembre 2024 | Portal Estudiantil - Sistema de Gestion Academica</p>
        </div>
      </div>
    </div>
  );
}

export default ModalTerminos;
