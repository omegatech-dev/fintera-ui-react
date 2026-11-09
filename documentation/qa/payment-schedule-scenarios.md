# Documento de Pruebas QA - PaymentScheduleModal

Este documento contiene escenarios de prueba para el componente `PaymentScheduleModal` en la aplicación FinteraUI. Los escenarios cubren funcionalidades clave como visualización de planes de pagos, aplicación de pagos, edición de mora, navegación por pestañas y manejo de errores. Todos los escenarios están escritos en español para facilitar su ejecución por el equipo de QA.

## Información General
- **Componente Probado**: `PaymentScheduleModal.jsx`
- **Ubicación**: `src/features/contracts/components/PaymentScheduleModal.jsx`
- **Dependencias**: Requiere contrato válido, usuario autenticado (preferiblemente admin), y acceso a APIs de backend.
- **Entorno de Prueba**: Staging o desarrollo, con datos de prueba.
- **Herramientas**: Navegador web, consola de desarrollador para logs.

## Escenarios de Prueba

### PSM-001: Cargar modal con contrato válido y mostrar plan de pagos
**Título**: Cargar modal con contrato válido y mostrar plan de pagos.  
**Precondiciones**: Usuario autenticado como admin, contrato aprobado con plan de pagos (o sintético generado).  
**Pasos**:  
1. Navegar a la lista de contratos.  
2. Seleccionar un contrato aprobado.  
3. Hacer clic en "Plan de Pagos".  
4. Verificar que el modal se abra correctamente.  
**Resultado Esperado**: El modal se carga, muestra información del contrato (cliente, proyecto, lote), plan de pagos en tabla con columnas (número, fecha, tipo, monto, interés, mora, días mora, estado), totales (subtotal, interés total, total), y pestaña "Plan de Pagos" activa.  
**Notas**: Usar contrato con al menos 3 cuotas. Verificar sin errores en consola.

### PSM-002: Aplicar pago exitoso a una cuota pendiente
**Título**: Aplicar pago exitoso a una cuota pendiente.  
**Precondiciones**: Contrato aprobado con cuota pendiente. Usuario admin.  
**Pasos**:  
1. Abrir modal del contrato.  
2. En tabla, hacer clic en "Aplicar" para cuota pendiente.  
3. Ingresar monto válido (ej. 1000.00), interés (ej. 50.00), verificar total automático.  
4. Hacer clic en "Aplicar Pago".  
**Resultado Esperado**: Pago aplicado, estado cambia a "Pagado", balance actualizado, mensaje éxito, tabla refresca.  
**Notas**: Verificar API `/api/v1/payments/{id}/approve`. Probar diferentes montos.

### PSM-003: Intentar aplicar pago con monto inválido
**Título**: Intentar aplicar pago con monto inválido (negativo o cero).  
**Precondiciones**: Contrato con cuota pendiente.  
**Pasos**:  
1. Abrir modal y seleccionar "Aplicar" en cuota pendiente.  
2. Ingresar monto negativo (ej. -100) o cero (0).  
3. Hacer clic en "Aplicar Pago".  
**Resultado Esperado**: Mensaje error ("El monto total debe ser mayor a 0"), modal no cierra, no llamada API.  
**Notas**: Probar campos vacíos o no numéricos.

### PSM-004: Aplicar abono a capital exitoso
**Título**: Aplicar abono a capital exitoso.  
**Precondiciones**: Contrato aprobado con balance pendiente. Usuario admin.  
**Pasos**:  
1. Abrir modal.  
2. Hacer clic en "Abono a Capital".  
3. Ingresar monto válido (ej. 500.00).  
4. Hacer clic en "Aplicar Abono".  
**Resultado Esperado**: Abono registrado, balance reducido, mensaje éxito, modal cierra.  
**Notas**: Verificar API `/api/v1/projects/{project_id}/lots/{lot_id}/contracts/{id}/capital_repayment`. Probar monto mayor al balance.

### PSM-005: Editar monto de mora en una cuota
**Título**: Editar monto de mora en una cuota.  
**Precondiciones**: Contrato con cuota editable de mora.  
**Pasos**:  
1. Abrir modal.  
2. Hacer clic en ícono lápiz (✏️) en columna "Mora" de cuota.  
3. Ingresar nuevo monto (ej. 200.00).  
4. Hacer clic en check (✓) para guardar.  
**Resultado Esperado**: Mora actualizada en tabla, mensaje éxito, totales recalculan.  
**Notas**: Probar cancelar con ✕. Verificar no afecta otras cuotas.

### PSM-006: Cambiar entre pestañas (Plan de Pagos, Asientos Contables, Notas)
**Título**: Cambiar entre pestañas (Plan de Pagos, Asientos Contables, Notas).  
**Precondiciones**: Contrato válido con datos en todas pestañas.  
**Pasos**:  
1. Abrir modal.  
2. Hacer clic en "Asientos Contables".  
3. Verificar contenido.  
4. Hacer clic en "Notas del Contrato".  
5. Verificar contenido.  
6. Regresar a "Plan de Pagos".  
**Resultado Esperado**: Pestañas cambian correctamente, cargando datos específicos (asientos en tabla, notas editables). Sin errores.  
**Notas**: Probar con contrato con ledger entries y notas. Verificar indicadores carga.

### PSM-007: Comportamiento en modo solo lectura (contrato cerrado)
**Título**: Comportamiento en modo solo lectura (contrato cerrado).  
**Precondiciones**: Contrato con status "closed".  
**Pasos**:  
1. Abrir modal de contrato cerrado.  
2. Intentar clic en botones acción (Aplicar, Abono a Capital, Editar Mora).  
3. Intentar editar notas.  
**Resultado Esperado**: Botones deshabilitados o invisibles, indicador "(Solo lectura)", no modificaciones permitidas. Footer muestra mensaje informativo.  
**Notas**: Verificar ícono candado en header.

### PSM-008: Cerrar modal sin guardar cambios
**Título**: Cerrar modal sin guardar cambios.  
**Precondiciones**: Modal abierto con datos cargados.  
**Pasos**:  
1. Abrir modal.  
2. Hacer cambios temporales (abrir modal aplicar pago pero no confirmar).  
3. Hacer clic en "Cerrar" o X.  
**Resultado Esperado**: Modal cierra sin guardar, regresa a vista anterior. Sin llamadas API.  
**Notas**: Probar cerrar desde diferentes pestañas.

### PSM-009: Manejo de error al cargar datos (API falla)
**Título**: Manejo de error al cargar datos (API falla).  
**Precondiciones**: Simular fallo API (desconectar internet o endpoint inválido).  
**Pasos**:  
1. Abrir modal.  
2. Esperar carga datos.  
**Resultado Esperado**: Mensaje error o indicador falla, modal no bloquea. Datos sintéticos usados si aplicable.  
**Notas**: Verificar logs consola. Probar contrato sin payment_schedule.

### PSM-010: Validación de cálculos automáticos en aplicar pago
**Título**: Validación de cálculos automáticos en aplicar pago.  
**Precondiciones**: Cuota pendiente.  
**Pasos**:  
1. Abrir modal aplicar pago.  
2. Ingresar monto (ej. 1000).  
3. Cambiar interés (ej. 100).  
4. Verificar total actualiza automáticamente (1100).  
**Resultado Esperado**: Campo "Total a Pagar" calcula correctamente (monto + interés).  
**Notas**: Probar decimales y valores grandes.

### PSM-011: Acceso sin permisos (usuario no admin)
**Título**: Acceso sin permisos (usuario no admin).  
**Precondiciones**: Usuario no admin.  
**Pasos**:  
1. Intentar abrir modal desde contrato.  
**Resultado Esperado**: Modal no abre o mensaje acceso denegado.  
**Notas**: Verificar botones acción ocultos para roles no admin.

### PSM-012: Probar responsive design en móvil
**Título**: Probar responsive design en móvil.  
**Precondiciones**: Usar dispositivo móvil o emulador.  
**Pasos**:  
1. Abrir modal en pantalla pequeña.  
2. Navegar pestañas y modales emergentes.  
**Resultado Esperado**: Modal adapta (scroll tabla, modales centrados), sin elementos cortados.  
**Notas**: Probar diferentes tamaños pantalla.

### PSM-013: Registrar pago extra exitoso
**Título**: Registrar pago extra exitoso.  
**Precondiciones**: Contrato aprobado. Usuario admin.  
**Pasos**:  
1. Abrir modal.  
2. Hacer clic en "+ Registrar Pago Extra".  
3. Ingresar monto válido (ej. 300.00).  
4. Hacer clic en "Guardar".  
**Resultado Esperado**: Pago extra registrado, balance actualizado, mensaje éxito.  
**Notas**: Verificar API `/api/v1/payments/{id}/extra_payment`.

### PSM-014: Deshacer transacción de pago
**Título**: Deshacer transacción de pago.  
**Precondiciones**: Contrato con pago aplicado.  
**Pasos**:  
1. Abrir modal.  
2. Hacer clic en "Deshacer" en cuota pagada.  
3. Confirmar en diálogo.  
**Resultado Esperado**: Transacción deshecha, estado regresa a pendiente, balance ajustado, mensaje éxito.  
**Notas**: Verificar API `/api/v1/payments/{id}/undo`.

### PSM-015: Mostrar score crediticio del cliente
**Título**: Mostrar score crediticio del cliente.  
**Precondiciones**: Contrato con historial de pagos.  
**Pasos**:  
1. Abrir modal.  
2. Verificar header con score (ej. 8/10 en verde).  
**Resultado Esperado**: Score mostrado correctamente, color según rango (verde 8-10, amarillo 6-8, rojo 1-6).  
**Notas**: Basado en pagos on-time vs atrasados.

## Notas Finales
- Ejecutar escenarios en orden lógico, empezando por PSM-001.
- Registrar resultados en una herramienta de gestión de pruebas (ej. Jira, TestRail).
- Reportar bugs con screenshots, logs y pasos para reproducir.
- Si se requieren datos específicos, coordinar con backend para mocks.
- Este documento se actualiza según cambios en el componente.