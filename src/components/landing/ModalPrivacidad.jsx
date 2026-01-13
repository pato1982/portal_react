import React from 'react';

function ModalPrivacidad({ activo, onCerrar }) {
  return (
    <div
      className={`modal-footer-overlay ${activo ? 'active' : ''}`}
      onClick={onCerrar}
    >
      <div className="modal-footer-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="modal-footer-header">
          <h2>Politica de Privacidad</h2>
          <button className="modal-footer-cerrar" onClick={onCerrar}>&times;</button>
        </div>
        <div className="modal-footer-body">
          <h3>1. Introduccion</h3>
          <p>En Portal Estudiantil nos comprometemos a proteger la privacidad y los datos personales de nuestros usuarios. Esta politica de privacidad describe como recopilamos, utilizamos, almacenamos y protegemos su informacion personal, en cumplimiento con la legislacion chilena vigente.</p>

          <h3>2. Marco Legal Aplicable</h3>
          <p>Nuestra politica de privacidad se rige por las siguientes normativas chilenas:</p>
          <ul>
            <li><strong>Ley N 19.628</strong> sobre Proteccion de la Vida Privada (Ley de Proteccion de Datos Personales), que regula el tratamiento de datos personales en registros o bancos de datos.</li>
            <li><strong>Ley N 21.096</strong> que consagra el derecho a la proteccion de datos personales como garantia constitucional.</li>
            <li><strong>Ley N 21.719</strong> (Nueva Ley de Proteccion de Datos Personales) que moderniza el marco regulatorio estableciendo nuevos estandares de proteccion.</li>
            <li><strong>Ley N 20.584</strong> sobre derechos y deberes de las personas en relacion con acciones vinculadas a su atencion de salud, en lo aplicable a datos sensibles.</li>
          </ul>

          <h3>3. Datos que Recopilamos</h3>
          <p>Recopilamos los siguientes tipos de datos personales:</p>
          <ul>
            <li><strong>Datos de identificacion:</strong> nombre completo, RUT, direccion, telefono y correo electronico.</li>
            <li><strong>Datos academicos:</strong> calificaciones, asistencia, observaciones pedagogicas y reportes de rendimiento.</li>
            <li><strong>Datos de uso:</strong> informacion sobre como interactua con nuestra plataforma.</li>
          </ul>

          <h3>4. Finalidad del Tratamiento</h3>
          <p>Sus datos personales seran utilizados exclusivamente para:</p>
          <ul>
            <li>Gestionar el registro academico de los estudiantes.</li>
            <li>Facilitar la comunicacion entre el establecimiento educacional, docentes y apoderados.</li>
            <li>Generar reportes de rendimiento academico.</li>
            <li>Enviar comunicados y notificaciones relevantes.</li>
            <li>Mejorar nuestros servicios y la experiencia del usuario.</li>
          </ul>

          <h3>5. Derechos de los Titulares</h3>
          <p>De acuerdo con la legislacion chilena, usted tiene derecho a:</p>
          <ul>
            <li><strong>Acceso:</strong> conocer que datos personales suyos estan siendo tratados.</li>
            <li><strong>Rectificacion:</strong> solicitar la correccion de datos inexactos o incompletos.</li>
            <li><strong>Cancelacion:</strong> solicitar la eliminacion de sus datos cuando corresponda.</li>
            <li><strong>Oposicion:</strong> oponerse al tratamiento de sus datos en determinadas circunstancias.</li>
            <li><strong>Portabilidad:</strong> recibir sus datos en un formato estructurado y de uso comun.</li>
          </ul>

          <h3>6. Seguridad de los Datos</h3>
          <p>Implementamos medidas tecnicas y organizativas apropiadas para proteger sus datos personales contra el acceso no autorizado, la alteracion, divulgacion o destruccion. Estas medidas incluyen encriptacion de datos, accesos restringidos y protocolos de seguridad actualizados.</p>

          <h3>7. Conservacion de Datos</h3>
          <p>Los datos personales seran conservados durante el tiempo necesario para cumplir con las finalidades descritas y conforme a los plazos establecidos por la normativa educacional chilena.</p>

          <h3>8. Contacto</h3>
          <p>Para ejercer sus derechos o realizar consultas sobre esta politica de privacidad, puede contactarnos a traves de nuestros canales oficiales: <strong>contacto.portalestudiantil@gmail.com</strong></p>
        </div>
        <div className="modal-footer-pie">
          <p>Ultima actualizacion: Noviembre 2024 | Portal Estudiantil - Sistema de Gestion Academica</p>
        </div>
      </div>
    </div>
  );
}

export default ModalPrivacidad;
