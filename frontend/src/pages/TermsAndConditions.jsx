import { Link } from 'react-router-dom';

export default function TermsAndConditions() {
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
            Términos y Condiciones
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
              Bienvenido a nuestro servicio de delivery de alimentos. Al utilizar nuestra plataforma, 
              aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con estos 
              términos, por favor no utilices nuestros servicios.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios 
              entrarán en vigor inmediatamente después de su publicación en el sitio web.
            </p>
          </section>

          {/* Uso del Servicio */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Uso del Servicio</h2>
            <div className="space-y-4 text-gray-700">
              <p className="font-semibold">2.1 Elegibilidad</p>
              <p className="leading-relaxed ml-4">
                Debes tener al menos 18 años para utilizar nuestros servicios. Al crear una cuenta, 
                garantizas que tienes la edad legal requerida.
              </p>
              
              <p className="font-semibold mt-4">2.2 Cuenta de Usuario</p>
              <ul className="list-disc ml-8 space-y-2">
                <li>Eres responsable de mantener la confidencialidad de tu cuenta y contraseña</li>
                <li>Debes proporcionar información precisa y actualizada</li>
                <li>No puedes compartir tu cuenta con terceros</li>
                <li>Debes notificarnos inmediatamente sobre cualquier uso no autorizado</li>
              </ul>

              <p className="font-semibold mt-4">2.3 Uso Aceptable</p>
              <p className="leading-relaxed ml-4">
                Te comprometes a utilizar nuestros servicios únicamente para fines legales y de acuerdo 
                con estos términos. No debes:
              </p>
              <ul className="list-disc ml-8 space-y-2">
                <li>Usar el servicio para actividades fraudulentas o ilegales</li>
                <li>Intentar acceder a sistemas o datos no autorizados</li>
                <li>Interferir con el funcionamiento del servicio</li>
                <li>Acosar, abusar o dañar a otros usuarios</li>
              </ul>
            </div>
          </section>

          {/* Pedidos y Pagos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Pedidos y Pagos</h2>
            <div className="space-y-4 text-gray-700">
              <p className="font-semibold">3.1 Realización de Pedidos</p>
              <ul className="list-disc ml-8 space-y-2">
                <li>Los pedidos están sujetos a disponibilidad de productos</li>
                <li>Nos reservamos el derecho de rechazar o cancelar pedidos</li>
                <li>Los precios pueden cambiar sin previo aviso</li>
                <li>Debes verificar tu pedido antes de confirmarlo</li>
              </ul>

              <p className="font-semibold mt-4">3.2 Métodos de Pago</p>
              <p className="leading-relaxed ml-4">
                Aceptamos los siguientes métodos de pago:
              </p>
              <ul className="list-disc ml-8 space-y-2">
                <li>Tarjetas de crédito y débito</li>
                <li>Pago en efectivo contra entrega</li>
                <li>Transferencias bancarias (según disponibilidad)</li>
              </ul>

              <p className="font-semibold mt-4">3.3 Cargos por Entrega</p>
              <p className="leading-relaxed ml-4">
                Los costos de entrega se calculan según la zona de entrega y pueden variar. 
                El costo total será mostrado antes de confirmar tu pedido.
              </p>
            </div>
          </section>

          {/* Entregas */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Entregas</h2>
            <div className="space-y-4 text-gray-700">
              <p className="font-semibold">4.1 Tiempos de Entrega</p>
              <p className="leading-relaxed ml-4">
                Los tiempos de entrega son estimados y pueden variar según factores como 
                tráfico, clima y volumen de pedidos. No somos responsables por retrasos 
                causados por circunstancias fuera de nuestro control.
              </p>

              <p className="font-semibold mt-4">4.2 Zonas de Entrega</p>
              <p className="leading-relaxed ml-4">
                Entregamos únicamente en las zonas especificadas en nuestra plataforma. 
                Verifica que tu dirección esté dentro de nuestra área de cobertura antes 
                de realizar un pedido.
              </p>

              <p className="font-semibold mt-4">4.3 Recepción de Pedidos</p>
              <ul className="list-disc ml-8 space-y-2">
                <li>Debes estar disponible en la dirección indicada</li>
                <li>Proporciona instrucciones claras de entrega si es necesario</li>
                <li>Verifica tu pedido al recibirlo</li>
                <li>Reporta cualquier problema inmediatamente</li>
              </ul>
            </div>
          </section>

          {/* Cancelaciones y Reembolsos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cancelaciones y Reembolsos</h2>
            <div className="space-y-4 text-gray-700">
              <p className="font-semibold">5.1 Cancelación por el Cliente</p>
              <p className="leading-relaxed ml-4">
                Puedes cancelar tu pedido sin cargo dentro de los primeros 5 minutos después 
                de haberlo realizado. Después de este tiempo, la cancelación estará sujeta a 
                evaluación y puede incurrir en cargos.
              </p>

              <p className="font-semibold mt-4">5.2 Cancelación por el Restaurante</p>
              <p className="leading-relaxed ml-4">
                El restaurante puede cancelar tu pedido por razones como falta de disponibilidad 
                de productos o problemas técnicos. En estos casos, recibirás un reembolso completo.
              </p>

              <p className="font-semibold mt-4">5.3 Política de Reembolsos</p>
              <ul className="list-disc ml-8 space-y-2">
                <li>Los reembolsos se procesarán dentro de 5-10 días hábiles</li>
                <li>El método de reembolso será el mismo utilizado para el pago</li>
                <li>No se reembolsan costos de entrega en pedidos completados</li>
                <li>Productos defectuosos o incorrectos serán reemplazados o reembolsados</li>
              </ul>
            </div>
          </section>

          {/* Cupones y Promociones */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cupones y Promociones</h2>
            <div className="space-y-4 text-gray-700">
              <ul className="list-disc ml-8 space-y-2">
                <li>Los cupones tienen fecha de vencimiento y condiciones específicas</li>
                <li>Solo se puede usar un cupón por pedido (salvo que se indique lo contrario)</li>
                <li>Los cupones no son transferibles ni canjeables por efectivo</li>
                <li>Nos reservamos el derecho de cancelar cupones utilizados fraudulentamente</li>
              </ul>
            </div>
          </section>

          {/* Responsabilidades */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitación de Responsabilidad</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                En la medida permitida por la ley, no seremos responsables por:
              </p>
              <ul className="list-disc ml-8 space-y-2">
                <li>Daños indirectos, incidentales o consecuentes</li>
                <li>Pérdida de datos, beneficios o oportunidades</li>
                <li>Problemas causados por terceros (restaurantes, repartidores externos)</li>
                <li>Interrupciones del servicio por mantenimiento o causas de fuerza mayor</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Nuestra responsabilidad máxima estará limitada al valor del pedido en cuestión.
              </p>
            </div>
          </section>

          {/* Propiedad Intelectual */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Propiedad Intelectual</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Todo el contenido de nuestra plataforma (textos, imágenes, logos, diseños) es propiedad 
                nuestra o de nuestros licenciantes y está protegido por leyes de derechos de autor.
              </p>
              <p className="leading-relaxed">
                No puedes copiar, modificar, distribuir o usar nuestro contenido sin autorización expresa.
              </p>
            </div>
          </section>

          {/* Resolución de Disputas */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Resolución de Disputas</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                En caso de cualquier disputa o reclamo relacionado con nuestros servicios:
              </p>
              <ol className="list-decimal ml-8 space-y-2">
                <li>Contacta primero a nuestro servicio de atención al cliente</li>
                <li>Intentaremos resolver el problema de manera amigable</li>
                <li>Si no se logra una solución, se aplicará la ley vigente de El Salvador</li>
                <li>Cualquier acción legal se llevará a cabo en los tribunales competentes</li>
              </ol>
            </div>
          </section>

          {/* Modificaciones */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modificaciones al Servicio</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Nos reservamos el derecho de:
              </p>
              <ul className="list-disc ml-8 space-y-2">
                <li>Modificar o discontinuar el servicio en cualquier momento</li>
                <li>Cambiar precios y tarifas de entrega</li>
                <li>Actualizar estos términos y condiciones</li>
                <li>Suspender o terminar cuentas que violen estos términos</li>
              </ul>
            </div>
          </section>

          {/* Contacto */}
          <section className="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl p-6 border border-sky-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Información de Contacto</h2>
            <div className="space-y-2 text-gray-700">
              <p>Si tienes preguntas sobre estos Términos y Condiciones, contáctanos:</p>
              <ul className="space-y-2 mt-4">
                <li>
                  <span className="font-semibold">Email:</span>{' '}
                  <a href="mailto:soporte@tudominio.com" className="text-sky-600 hover:text-sky-700">
                    soporte@tudominio.com
                  </a>
                </li>
                <li>
                  <span className="font-semibold">Teléfono:</span>{' '}
                  <a href="tel:+50312345678" className="text-sky-600 hover:text-sky-700">
                    +503 1234-5678
                  </a>
                </li>
                <li>
                  <span className="font-semibold">Dirección:</span> San Salvador, El Salvador
                </li>
              </ul>
            </div>
          </section>

          {/* Aceptación */}
          <section className="bg-sky-100 rounded-xl p-6 border-2 border-sky-300">
            <p className="text-gray-800 font-medium text-center">
              Al utilizar nuestros servicios, confirmas que has leído, entendido y aceptado 
              estos Términos y Condiciones en su totalidad.
            </p>
          </section>

        </div>

        {/* Links a otras políticas */}
        <div className="mt-8 text-center space-x-4">
          <Link 
            to="/privacy-policy" 
            className="text-sky-600 hover:text-sky-700 font-medium underline"
          >
            Política de Privacidad
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
