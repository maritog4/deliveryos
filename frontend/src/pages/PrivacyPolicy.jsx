import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            to="/menu" 
            className="inline-flex items-center text-sky-600 hover:text-sky-700 font-medium mb-4"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Política de Privacidad
          </h1>
          <p className="text-gray-600 mt-2">
            Última actualización: 25 de enero de 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Introducción */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introducción</h2>
            <p className="text-gray-700 leading-relaxed">
              En nuestra plataforma de delivery, valoramos tu privacidad y nos comprometemos a proteger 
              tu información personal. Esta Política de Privacidad explica cómo recopilamos, usamos, 
              almacenamos y compartimos tu información cuando utilizas nuestros servicios.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Al usar nuestra plataforma, aceptas las prácticas descritas en esta política. Si no estás 
              de acuerdo, por favor no utilices nuestros servicios.
            </p>
          </section>

          {/* Información que Recopilamos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Información que Recopilamos</h2>
            <div className="space-y-4 text-gray-700">
              
              <div>
                <p className="font-semibold text-lg">2.1 Información que Proporcionas Directamente</p>
                <p className="leading-relaxed mt-2 ml-4">
                  Cuando creas una cuenta o realizas un pedido, recopilamos:
                </p>
                <ul className="list-disc ml-8 space-y-2 mt-2">
                  <li><strong>Datos personales:</strong> Nombre completo, correo electrónico, número de teléfono</li>
                  <li><strong>Dirección de entrega:</strong> Dirección completa, referencias, coordenadas GPS</li>
                  <li><strong>Información de pago:</strong> Detalles de tarjetas (procesados de forma segura por terceros)</li>
                  <li><strong>Preferencias:</strong> Productos favoritos, historial de pedidos</li>
                  <li><strong>Comunicaciones:</strong> Mensajes de contacto, reseñas, comentarios</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-lg mt-6">2.2 Información Recopilada Automáticamente</p>
                <p className="leading-relaxed mt-2 ml-4">
                  Cuando usas nuestra plataforma, recopilamos automáticamente:
                </p>
                <ul className="list-disc ml-8 space-y-2 mt-2">
                  <li><strong>Datos de uso:</strong> Páginas visitadas, tiempo en el sitio, clicks</li>
                  <li><strong>Datos del dispositivo:</strong> Tipo de dispositivo, sistema operativo, navegador</li>
                  <li><strong>Dirección IP:</strong> Para seguridad y análisis de ubicación</li>
                  <li><strong>Cookies:</strong> Para mejorar la experiencia del usuario</li>
                  <li><strong>Ubicación GPS:</strong> Para rastreo de entregas (con tu permiso)</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-lg mt-6">2.3 Información de Terceros</p>
                <ul className="list-disc ml-8 space-y-2 mt-2">
                  <li>Información de redes sociales si inicias sesión con ellas</li>
                  <li>Datos de pasarelas de pago para procesar transacciones</li>
                  <li>Información de servicios de mapas para entregas</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cómo Usamos tu Información */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cómo Usamos tu Información</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">Utilizamos tu información personal para:</p>
              
              <div>
                <p className="font-semibold">3.1 Prestación del Servicio</p>
                <ul className="list-disc ml-8 space-y-2 mt-2">
                  <li>Procesar y gestionar tus pedidos</li>
                  <li>Coordinar entregas y asignar repartidores</li>
                  <li>Procesar pagos de forma segura</li>
                  <li>Proporcionar rastreo en tiempo real</li>
                  <li>Gestionar tu cuenta y preferencias</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mt-4">3.2 Comunicación</p>
                <ul className="list-disc ml-8 space-y-2 mt-2">
                  <li>Confirmar pedidos y enviar actualizaciones de estado</li>
                  <li>Responder a consultas y brindar soporte</li>
                  <li>Enviar notificaciones importantes del servicio</li>
                  <li>Compartir promociones y ofertas especiales (con tu consentimiento)</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mt-4">3.3 Mejora y Personalización</p>
                <ul className="list-disc ml-8 space-y-2 mt-2">
                  <li>Personalizar tu experiencia en la plataforma</li>
                  <li>Recomendar productos basados en tu historial</li>
                  <li>Analizar tendencias y mejorar nuestros servicios</li>
                  <li>Realizar investigación de mercado</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mt-4">3.4 Seguridad y Legal</p>
                <ul className="list-disc ml-8 space-y-2 mt-2">
                  <li>Prevenir fraudes y actividades ilegales</li>
                  <li>Proteger la seguridad de usuarios y plataforma</li>
                  <li>Cumplir con obligaciones legales y regulatorias</li>
                  <li>Resolver disputas y hacer cumplir nuestros términos</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Compartir Información */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cómo Compartimos tu Información</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Compartimos tu información solo cuando es necesario y bajo estas circunstancias:
              </p>

              <div>
                <p className="font-semibold">4.1 Con Proveedores de Servicio</p>
                <ul className="list-disc ml-8 space-y-2 mt-2">
                  <li><strong>Restaurantes:</strong> Nombre, dirección de entrega, detalles del pedido</li>
                  <li><strong>Repartidores:</strong> Dirección de entrega, número de contacto</li>
                  <li><strong>Procesadores de pago:</strong> Información necesaria para transacciones</li>
                  <li><strong>Servicios de mapas:</strong> Ubicación para rastreo de entregas</li>
                  <li><strong>Servicios de email/SMS:</strong> Para enviar notificaciones</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mt-4">4.2 Por Razones Legales</p>
                <p className="ml-4 mt-2">Podemos divulgar tu información si:</p>
                <ul className="list-disc ml-8 space-y-2 mt-2">
                  <li>Es requerido por ley o proceso legal</li>
                  <li>Es necesario para proteger nuestros derechos legales</li>
                  <li>Se debe prevenir fraude o actividad ilegal</li>
                  <li>Se requiere para proteger la seguridad pública</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mt-4">4.3 Con tu Consentimiento</p>
                <p className="ml-4 mt-2">
                  Compartiremos tu información con otros terceros solo cuando nos des tu consentimiento 
                  explícito para hacerlo.
                </p>
              </div>

              <div>
                <p className="font-semibold mt-4">4.4 NO Vendemos tu Información</p>
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 mt-2">
                  <p className="text-emerald-900 font-medium">
                    ✓ Nunca vendemos tu información personal a terceros con fines comerciales
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Cookies y Tecnologías */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies y Tecnologías Similares</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Utilizamos cookies y tecnologías similares para:
              </p>
              
              <div>
                <p className="font-semibold">5.1 Tipos de Cookies que Usamos</p>
                <ul className="list-disc ml-8 space-y-2 mt-2">
                  <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento del sitio</li>
                  <li><strong>Cookies de rendimiento:</strong> Para analizar el uso de la plataforma</li>
                  <li><strong>Cookies funcionales:</strong> Para recordar tus preferencias</li>
                  <li><strong>Cookies de marketing:</strong> Para mostrar contenido relevante (con tu permiso)</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mt-4">5.2 Control de Cookies</p>
                <p className="ml-4 mt-2">
                  Puedes controlar las cookies a través de la configuración de tu navegador. Ten en cuenta 
                  que bloquear cookies puede afectar la funcionalidad de nuestra plataforma.
                </p>
              </div>
            </div>
          </section>

          {/* Seguridad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Seguridad de tu Información</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Implementamos medidas de seguridad para proteger tu información:
              </p>
              <ul className="list-disc ml-8 space-y-2 mt-2">
                <li>Encriptación SSL/TLS para transmisión de datos</li>
                <li>Almacenamiento seguro en servidores protegidos</li>
                <li>Acceso restringido a información personal</li>
                <li>Monitoreo regular de vulnerabilidades</li>
                <li>Procedimientos de respuesta a incidentes</li>
              </ul>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mt-4">
                <p className="text-amber-900">
                  <strong>⚠️ Importante:</strong> Ningún sistema es 100% seguro. Aunque tomamos medidas 
                  razonables, no podemos garantizar seguridad absoluta. Mantén tu contraseña segura y 
                  repórtanos cualquier actividad sospechosa.
                </p>
              </div>
            </div>
          </section>

          {/* Retención de Datos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Retención de Datos</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Conservamos tu información personal mientras:
              </p>
              <ul className="list-disc ml-8 space-y-2 mt-2">
                <li>Mantengas una cuenta activa con nosotros</li>
                <li>Sea necesario para prestarte nuestros servicios</li>
                <li>Lo requiera la ley (por ejemplo, registros fiscales)</li>
                <li>Sea necesario para resolver disputas o hacer cumplir acuerdos</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Después de estos períodos, eliminaremos o anonimizaremos tu información de manera segura.
              </p>
            </div>
          </section>

          {/* Tus Derechos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Tus Derechos de Privacidad</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">Tienes derecho a:</p>
              
              <ul className="list-disc ml-8 space-y-3 mt-2">
                <li>
                  <strong>Acceso:</strong> Solicitar una copia de tu información personal
                </li>
                <li>
                  <strong>Corrección:</strong> Actualizar información inexacta o incompleta
                </li>
                <li>
                  <strong>Eliminación:</strong> Solicitar la eliminación de tu cuenta y datos
                </li>
                <li>
                  <strong>Portabilidad:</strong> Recibir tus datos en formato estructurado
                </li>
                <li>
                  <strong>Oposición:</strong> Oponerte a ciertos usos de tu información
                </li>
                <li>
                  <strong>Restricción:</strong> Limitar cómo usamos tu información
                </li>
                <li>
                  <strong>Retiro de consentimiento:</strong> Retirar permisos otorgados previamente
                </li>
              </ul>

              <div className="bg-sky-50 border-2 border-sky-200 rounded-lg p-4 mt-4">
                <p className="text-sky-900">
                  <strong>📧 Para ejercer tus derechos:</strong> Contáctanos en{' '}
                  <a href="mailto:privacidad@tudominio.com" className="text-sky-600 hover:text-sky-700 underline">
                    privacidad@tudominio.com
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Menores de Edad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Menores de Edad</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos 
                intencionalmente información de menores de edad. Si eres padre/madre y crees que tu 
                hijo nos ha proporcionado información, contáctanos inmediatamente para eliminarla.
              </p>
            </div>
          </section>

          {/* Enlaces a Terceros */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Enlaces a Sitios de Terceros</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Nuestra plataforma puede contener enlaces a sitios web de terceros. No somos responsables 
                de las prácticas de privacidad de estos sitios. Te recomendamos leer sus políticas de 
                privacidad antes de proporcionarles información.
              </p>
            </div>
          </section>

          {/* Transferencias Internacionales */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Transferencias Internacionales</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Tu información puede ser transferida y almacenada en servidores ubicados fuera de tu país. 
                Cuando esto ocurra, implementaremos medidas apropiadas para proteger tu información de 
                acuerdo con esta política.
              </p>
            </div>
          </section>

          {/* Cambios a la Política */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Cambios a esta Política</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en 
                nuestras prácticas o por razones legales. Te notificaremos sobre cambios importantes por:
              </p>
              <ul className="list-disc ml-8 space-y-2 mt-2">
                <li>Email a tu dirección registrada</li>
                <li>Aviso destacado en nuestra plataforma</li>
                <li>Notificación en tu cuenta</li>
              </ul>
              <p className="leading-relaxed mt-4">
                La fecha de "Última actualización" al inicio de esta política indicará cuándo se realizó 
                el cambio más reciente.
              </p>
            </div>
          </section>

          {/* Contacto */}
          <section className="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl p-6 border border-sky-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contáctanos</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Si tienes preguntas, inquietudes o deseas ejercer tus derechos de privacidad, contáctanos:
              </p>
              <div className="space-y-2 mt-4">
                <p>
                  <span className="font-semibold">Email de Privacidad:</span>{' '}
                  <a href="mailto:privacidad@tudominio.com" className="text-sky-600 hover:text-sky-700 underline">
                    privacidad@tudominio.com
                  </a>
                </p>
                <p>
                  <span className="font-semibold">Soporte General:</span>{' '}
                  <a href="mailto:soporte@tudominio.com" className="text-sky-600 hover:text-sky-700 underline">
                    soporte@tudominio.com
                  </a>
                </p>
                <p>
                  <span className="font-semibold">Teléfono:</span>{' '}
                  <a href="tel:+50312345678" className="text-sky-600 hover:text-sky-700 underline">
                    +503 1234-5678
                  </a>
                </p>
                <p>
                  <span className="font-semibold">Dirección:</span> San Salvador, El Salvador
                </p>
                <p className="mt-4 text-sm text-gray-600">
                  Responderemos a tu solicitud dentro de 30 días hábiles.
                </p>
              </div>
            </div>
          </section>

          {/* Compromiso */}
          <section className="bg-emerald-100 rounded-xl p-6 border-2 border-emerald-300">
            <p className="text-emerald-900 font-medium text-center">
              🛡️ Tu privacidad es importante para nosotros. Nos comprometemos a proteger tu información 
              personal y a ser transparentes sobre cómo la usamos.
            </p>
          </section>

        </div>

        {/* Links */}
        <div className="mt-8 text-center space-x-4">
          <Link 
            to="/terms-and-conditions" 
            className="text-sky-600 hover:text-sky-700 font-medium underline"
          >
            Términos y Condiciones
          </Link>
          <span className="text-gray-400">|</span>
          <Link 
            to="/menu" 
            className="text-sky-600 hover:text-sky-700 font-medium underline"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
