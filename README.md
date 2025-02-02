# Mega-Hackatotem
Hackaton con los nenes más brijidos y que saen 

Flujo de la app: 
1. Persona se acerca al totem (dispositivo)
2. la pantalla le sugiere 'acercarse o poner su cara en un lugar (si es que fuera necesario) y 'escanea su rostro'. 
2.A -No tiene registrado el rostro de la persona por lo que 'registra' el rostro (los puntos 'landmark'), y abre un campo de ID de la persona 'ingrese su RUT' (el idpersona), al ingresarlo, 'envia a la base de datos el ID' y busca envia un POST para obtener el nombre de la persona (y otros datos quizá), y en un JSON recibe esos datos. 
-Le dice 'Gracias {Nombre de la persona}, y aparecen las preguntas (punto 3)' 
2.B -Reconoce el rostro y por tanto tiene el ID y nombre y la saluda hola {nombre} y se abren las siguientes preguntas: 

3.Pregunta 1. (si viene llegando)¿Cómo te sientes hoy? (cómo está tu ánimo) (energética, cansada, agotada, meh, etc.)(NUBE de tags?) o indicador de 1-5 con algo 

Pregunta 2. Cómo se siente tu lesión(es)/trastorno? - (Escala eva visual) (me surge la inquietud de qué pasa en los casos de que tengan 'más de una lesión' o en casos de 'pacientes con enfermedades crónicas')
Pregunta 3. Registra el dolor de su lesión -> escala eva numérica (0-10)

4. un botón de 'enviar' o 'guardar' o 'confirmar' (pero de todas formas, las opciones previamente seleccionadas estaban siendo guardadas.)

Se registra: la hora del escaneo, de las respuestas y del envío (para calcular cuanto tiempo se demoró entre que reconoció su cara y terminó de responder las preguntas), (ojalá entre preguntas tuviera también un timestamp, así vemos si tardan o no más en decidir) todo esto queda guardado en el 'historial' de la persona, que posteriormente se usará para hacer un informe de evolución de su lesión.

Consideraciones: 
-Probablemente -por orden- habría que adicionalmente al rostro, preguntarle directamente por su 'patología/trastorno, lesión que más le acongoja o la cual viene a 'tratarse' aquí'. 
-En algún punto, 'terminado el registro de las preguntas' puede aparecerle 'un gráfico con las respuestas previas y otros datos de la persona (n° de sesiones que lleva, u otra información interesante, próximo pago, etc)

To-Do List:
1.Main Quest 1: 
-Ver como montar la librería 'Face recognition' de python en 'local' -> para android/ios 


Main Quest 2: 
-Montar una BD para almacenar los datos recopilados de la app. 

Main Quest 3: 
