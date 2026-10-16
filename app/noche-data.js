/* =====================================================================
   El Secreto de la Noche — contenido (OTO 2 de El Truco de la Insulina)
   Se edita acá. Los audios van en audios/noche/audio-01.mp3 … audio-07.mp3
   (si un archivo no está, la app muestra el texto para leer).
   ===================================================================== */
window.NOCHE = {
  nombre: "El Secreto de la Noche",
  sub: "Sueño y cortisol: que la insulina baje mientras dormís",

  intro: "Durante el día el licuado te baja la insulina. Pero si a la noche dormís mal, tu cuerpo larga cortisol, el cortisol le pide azúcar al hígado y te levantás con la insulina alta antes de desayunar. Esto es lo que vas a hacer para apagar el cortisol antes de dormir y que tu cuerpo trabaje para vos también de noche.",

  /* ---------- 1. El Ritual de los 20 Minutos ---------- */
  ritual: {
    titulo: "El Ritual de los 20 Minutos",
    bajada: "Lo que hacés antes de acostarte, paso a paso, para apagar el cortisol. Sin aparatos, sin gastar nada.",
    cuando: "Empezalo 20 minutos antes de la hora en que querés estar dormida. Si te acostás a las 23, arrancá a las 22:40.",
    pasos: [
      { n: 1, min: 3, titulo: "Luz baja, pantallas afuera", texto: "Apagá las luces fuertes de la casa y dejá prendida solo una lámpara cálida. El celular, en modo avión o cargando lejos de la cama. La luz blanca de las pantallas le dice a tu cerebro que es de día y frena la melatonina.", tip: "Si necesitás el celular para el audio del paso 5, dejalo con el brillo al mínimo y boca abajo." },
      { n: 2, min: 5, titulo: "La infusión del día", texto: "Prepará la infusión que toca hoy (la ves en Las 7 Infusiones) y tomala tibia, despacio, sentada. Sin azúcar; si querés, media cucharadita de miel cuando ya está tibia.", tip: "Tomala por lo menos 30 minutos antes de acostarte, así no te despertás para ir al baño." },
      { n: 3, min: 5, titulo: "Respiración 4-7-8", texto: "Sentada o acostada: inhalá por la nariz contando 4, aguantá el aire contando 7 y soltalo por la boca, lento, contando 8. Repetí 4 veces, descansá un minuto y hacé 4 más. Es la forma más rápida de bajar el ritmo del corazón y avisarle a tu cuerpo que puede soltar.", tip: "Si te mareás, hacelo más corto (3-5-6). Lo importante es que la exhalación sea más larga que la inhalación." },
      { n: 4, min: 4, titulo: "Pies tibios", texto: "Una ducha tibia corta o, más simple todavía, los pies en un balde con agua tibia 4 minutos. Al salir, el cuerpo baja la temperatura y esa bajada es una de las señales que usa para dormirse.", tip: "Medias de algodón en la cama si sos de pies fríos: ayudan a dormirse más rápido." },
      { n: 5, min: 3, titulo: "El audio en la cama", texto: "Ya acostada, con la luz apagada, poné el audio de esta noche, cerrá los ojos y seguí la voz. No hace falta escucharlo entero: si te dormís en el medio, funcionó.", tip: "Elegí el audio según cómo te sentís, o el que te marca el Plan de 21 Noches." }
    ],
    corto: {
      titulo: "Versión de 10 minutos para noches difíciles",
      texto: "Para las noches en que llegás muerta: no te saltees todo, hacé el mínimo.",
      pasos: ["Luces bajas y celular lejos (1 minuto).", "4 respiraciones 4-7-8 sentada en la cama (2 minutos).", "Acostate y poné el audio 2, \"Respirar\" (5 minutos o lo que dure hasta que te duermas)."]
    }
  },

  /* ---------- 2. Las 7 Infusiones de la Noche ---------- */
  infusiones: [
    { dia: "Lunes", emoji: "🌼", nombre: "Tilo", para: "Arrancar la semana bajando la ansiedad del lunes.", ingredientes: ["1 cucharada de flores de tilo (o 1 saquito)", "250 ml de agua"], prep: "Calentá el agua hasta que esté a punto de hervir, apagá y agregá el tilo. Tapá y dejá reposar 5 minutos. Colá.", cuidado: "Muy suave. Evitá tomar más de 3 tazas por día.", donde: "Dietética o súper" },
    { dia: "Martes", emoji: "🌿", nombre: "Manzanilla con cedrón", para: "Calmar la panza y la cabeza a la vez.", ingredientes: ["1 saquito de manzanilla", "4 o 5 hojas de cedrón (frescas o secas)", "250 ml de agua"], prep: "Agua caliente sin hervir sobre la manzanilla y el cedrón. Tapá 5 minutos y colá.", cuidado: "Si sos alérgica a la margarita o al polen, probá primero con poca cantidad.", donde: "Súper (manzanilla) y dietética o vivero (cedrón)" },
    { dia: "Miércoles", emoji: "🍃", nombre: "Melisa", para: "El día del medio de la semana, cuando se acumula el estrés.", ingredientes: ["1 cucharada de hojas de melisa secas (o un puñado de frescas)", "250 ml de agua"], prep: "Agua caliente sobre la melisa, tapá 7 minutos y colá. Tiene un aroma suave a limón.", cuidado: "Si tomás medicación para la tiroides, consultá con tu médico antes de tomarla todos los días.", donde: "Dietética" },
    { dia: "Jueves", emoji: "💜", nombre: "Pasionaria", para: "Las noches en que te cuesta apagar los pensamientos.", ingredientes: ["1 cucharadita de pasionaria (pasiflora) seca", "250 ml de agua"], prep: "Agua caliente sobre la pasionaria, tapá 8 minutos y colá.", cuidado: "No la combines con pastillas para dormir ni con alcohol. Evitala en el embarazo y la lactancia.", donde: "Dietética o herboristería" },
    { dia: "Viernes", emoji: "🌱", nombre: "Hinojo", para: "Después de una cena más pesada: desinflama y ayuda a digerir.", ingredientes: ["1 cucharadita de semillas de hinojo (o de anís)", "250 ml de agua"], prep: "Machacá apenas las semillas con una cuchara, agregá el agua caliente, tapá 7 minutos y colá.", cuidado: "Evitá tomarla todos los días durante el embarazo.", donde: "Súper o dietética" },
    { dia: "Sábado", emoji: "🥛", nombre: "Leche tibia con canela", para: "Una noche más mimosa, sin salirte de la rutina.", ingredientes: ["200 ml de leche (o leche vegetal sin azúcar)", "1 pizca generosa de canela", "Opcional: 1 pizca de nuez moscada"], prep: "Calentá la leche sin que hierva, agregá la canela, revolvé y tomala tibia.", cuidado: "Si la leche te inflama, usá leche vegetal sin azúcar.", donde: "Súper" },
    { dia: "Domingo", emoji: "🌙", nombre: "Valeriana", para: "La angustia del domingo a la noche o las noches de mucha ansiedad.", ingredientes: ["1 cucharadita de raíz de valeriana seca (o 1 saquito)", "250 ml de agua"], prep: "Agua caliente sobre la valeriana, tapá 10 minutos y colá. El olor es fuerte; el sabor mejora con unas hojas de menta.", cuidado: "No la combines con pastillas para dormir, ansiolíticos ni alcohol. No la uses todas las noches más de 2 semanas seguidas. Evitala en el embarazo y la lactancia.", donde: "Dietética o herboristería" }
  ],

  /* ---------- 3. Los 7 Audios para Dormir ---------- */
  audios: [
    { n: 1, titulo: "Soltar el día", para: "Para cerrar el día y dejar las preocupaciones afuera de la cama.",
      guion: "Hola. Soy Claudia. Acomodate en la cama... apagá la luz... y dejá el celular boca abajo. Esta noche no tenés que hacer nada más. Ya hiciste suficiente por hoy.\n\nTomá aire por la nariz, despacito... y soltalo por la boca, largo, como si apagaras una vela. Otra vez... inhalá... y soltá.\n\nAhora te propongo algo. Imaginá que al lado de la cama hay una caja. Una caja de madera, con tapa. Ahí vamos a guardar el día.\n\nPensá en lo primero que te preocupa. Puede ser el trabajo, una cuenta, algo que te dijeron. No hace falta resolverlo. Solo nombralo en tu cabeza... y ponelo en la caja. Ya está guardado. Mañana va a seguir ahí, si lo necesitás.\n\nAhora pensá en lo segundo. Algo que quedó pendiente, algo que no salió como querías. También va a la caja. No es tuyo esta noche.\n\nY si aparece algo más, cualquier cosa... también va adentro.\n\nAhora cerrá la tapa. Despacito. Escuchá el clic. El día quedó adentro. Afuera de la cama.\n\nRespirá otra vez... inhalá... y soltá.\n\nSentí el peso de tu cuerpo sobre el colchón. Los talones... las piernas... la espalda... los hombros. Todo apoyado. No tenés que sostener nada.\n\nCada vez que vuelva un pensamiento, y va a volver, porque así funciona la cabeza, no te enojes. Decile: \"mañana\". Y ponelo en la caja.\n\nMientras dormís, tu cuerpo hace su trabajo. Baja el cortisol... baja la insulina... repara. No tenés que hacer nada para que eso pase. Solo descansar.\n\nInhalá... y soltá.\n\nYa hiciste lo que tenías que hacer hoy. Ahora te toca descansar. Buenas noches." },
    { n: 2, titulo: "Respirar", para: "Respiración guiada 4-7-8. El más corto y el que más sirve en noches difíciles.",
      guion: "Hola. Soy Claudia. Esta noche vamos a hacer una sola cosa: respirar. Nada más.\n\nAcostate boca arriba, o de costado, como estés más cómoda. Apoyá una mano sobre la panza.\n\nVamos a respirar en cuatro, aguantar en siete y soltar en ocho. Yo cuento con vos.\n\nInhalá por la nariz... uno... dos... tres... cuatro.\nAguantá... uno... dos... tres... cuatro... cinco... seis... siete.\nY soltá por la boca, lento... uno... dos... tres... cuatro... cinco... seis... siete... ocho.\n\nMuy bien. Otra vez.\n\nInhalá... dos... tres... cuatro.\nAguantá... dos... tres... cuatro... cinco... seis... siete.\nSoltá... dos... tres... cuatro... cinco... seis... siete... ocho.\n\nSentí cómo la mano sube y baja con la panza.\n\nUna vez más.\n\nInhalá... dos... tres... cuatro.\nAguantá... dos... tres... cuatro... cinco... seis... siete.\nSoltá... dos... tres... cuatro... cinco... seis... siete... ocho.\n\nY la última de esta tanda.\n\nInhalá... dos... tres... cuatro.\nAguantá... dos... tres... cuatro... cinco... seis... siete.\nSoltá... dos... tres... cuatro... cinco... seis... siete... ocho.\n\nAhora dejá de contar. Respirá como te salga, sin esfuerzo.\n\nCuando la exhalación es más larga que la inhalación, tu corazón baja el ritmo. Y tu cuerpo entiende que está a salvo. Que puede apagar el cortisol. Que puede dormir.\n\nSi en algún momento te despertás esta noche, volvé a esto: cuatro... siete... ocho.\n\nSeguí respirando así, tranquila. Yo me quedo un ratito más en silencio con vos.\n\n...\n\nBuenas noches." },
    { n: 3, titulo: "Cuerpo pesado", para: "Relajación de pies a cabeza para cuando el cuerpo está tenso.",
      guion: "Hola. Soy Claudia. Acostate boca arriba, con los brazos al costado del cuerpo. Cerrá los ojos.\n\nVamos a recorrer el cuerpo de abajo hacia arriba, aflojando cada parte.\n\nEmpezamos por los pies. Apretá los dedos de los pies, fuerte... un poquito más... y soltá. Sentí cómo los pies se ponen pesados. Muy pesados. Se hunden en el colchón.\n\nAhora las pantorrillas. Tensalas... y soltá. El peso sube por las piernas.\n\nLos muslos. Apretalos... aguantá... y soltá. Las piernas enteras están pesadas, tibias, quietas.\n\nLa cola y la cadera. Apretá... y soltá. Sentí cómo la cadera se apoya.\n\nLa panza. Inflala con aire... y soltala. Dejala blandita. No hay nada que sostener.\n\nLas manos. Cerrá los puños fuerte... más... y abrilos. Los dedos se aflojan.\n\nLos brazos. Tensalos... y soltá. Caen pesados a los costados.\n\nLos hombros. Subilos hacia las orejas... aguantá... y dejalos caer. Ahí se guarda mucho del día. Dejalo ir.\n\nLa cara. Apretá los ojos, la boca, la frente... y soltá. Separá apenas los dientes. Aflojá la lengua. Aflojá el entrecejo.\n\nAhora todo tu cuerpo está pesado. Como si fuera de arena tibia.\n\nRespirá... y con cada exhalación, el cuerpo se pone un poco más pesado. Un poco más quieto.\n\nSi alguna parte se volvió a tensar, volvé a ella y soltala.\n\nTu cuerpo ya sabe dormir. Solo necesitaba que lo dejaras.\n\nQuedate así... pesada... tranquila... y dejate ir. Buenas noches." },
    { n: 4, titulo: "La cabeza a mil", para: "Para cuando no podés parar de pensar.",
      guion: "Hola. Soy Claudia. Si estás escuchando este audio, seguramente tu cabeza no para. Pensás en mañana, en lo que no hiciste, en lo que alguien dijo. Está bien. Le pasa a todo el mundo. No vamos a pelear con los pensamientos. Vamos a dejarlos pasar.\n\nRespirá hondo... y soltá largo.\n\nImaginá que estás acostada en el pasto, una noche de verano, mirando el cielo. Hay nubes que pasan despacio.\n\nCada pensamiento que aparece es una nube. La ves llegar... la mirás... y la dejás pasar. No te subís a la nube. No la seguís. Solo la mirás irse.\n\nAparece una: \"tengo que hacer tal cosa mañana\". Es una nube. Pasa.\n\nAparece otra: \"¿y si sale mal?\". Otra nube. Pasa.\n\nEntre nube y nube, hay cielo. Un cielo oscuro, tranquilo, con alguna estrella. Ese cielo sos vos. Las nubes pasan; el cielo se queda.\n\nAhora vamos a hacer algo para que la cabeza tenga en qué entretenerse. Vamos a contar para atrás, desde cien, de tres en tres. Cien... noventa y siete... noventa y cuatro... Seguí vos, despacito, a tu ritmo. Si te perdés, no importa. Volvé a empezar desde cien.\n\nMientras contás, respirá lento.\n\n...\n\nLa cabeza a mil es cortisol. No es que seas así. Es tu cuerpo en modo alerta. Y cada respiración lenta lo saca de ese modo.\n\nSeguí contando... o solo mirando las nubes pasar.\n\nNo tenés que dormirte. Solo descansar. El sueño llega solo cuando dejás de buscarlo.\n\nBuenas noches." },
    { n: 5, titulo: "Si te despertás a las 3", para: "Para volver a dormirte cuando te despertás en el medio de la noche.",
      guion: "Hola. Soy Claudia. Si te despertaste en el medio de la noche, primero lo más importante: no mires la hora. No hace falta saber qué hora es. Mirar el reloj activa la cabeza y empezás a hacer cuentas.\n\nQuedate acostada. No prendas la luz.\n\nTe despertás a las tres de la mañana muchas veces por el cortisol. Es normal. No significa que algo esté mal. Y no significa que la noche esté perdida.\n\nRespirá conmigo. Inhalá en cuatro... aguantá en siete... soltá en ocho. Otra vez... cuatro... siete... ocho.\n\nSi tenés la boca seca, tomá un sorbo de agua y volvé a acostarte.\n\nSi te despertaste con hambre, puede ser que la cena haya sido muy temprano o muy liviana. Para la próxima, sumá una proteína a la cena. Esta noche, si el hambre no te deja, comé unas pocas almendras o nueces, despacio, y volvé a la cama.\n\nAhora aflojá la cara. La frente... los ojos... la mandíbula. Separá los dientes.\n\nAflojá los hombros. Dejalos caer.\n\nY ahora no intentes dormirte. En serio. Proponete solo descansar con los ojos cerrados. Descansar también repara. Cuando dejás de pelear por dormirte, el sueño vuelve.\n\nSi después de un rato largo seguís despierta, levantate, andá a otro ambiente con luz bien baja, leé algo en papel unos minutos y volvé a la cama cuando sientas sueño. La cama es para dormir, no para pelear con el insomnio.\n\nPor ahora, respirá... inhalá... y soltá largo.\n\nEstás bien. Estás a salvo. Tu cuerpo sabe volver a dormirse.\n\nBuenas noches." },
    { n: 6, titulo: "Ansiedad", para: "Para las noches de angustia o con el pecho apretado.",
      guion: "Hola. Soy Claudia. Si sentís el pecho apretado, el corazón rápido o un nudo en la panza, vamos a ir despacio. No estás sola.\n\nPrimero, apoyá los pies en algo: el colchón, la sábana. Sentí que estás acá. En tu cama. En tu casa.\n\nVamos a usar los sentidos para traer a la cabeza al presente.\n\nNombrá en silencio tres cosas que podés tocar. La sábana. La almohada. Tu mano.\n\nAhora dos cosas que podés escuchar. Puede ser mi voz. Puede ser un auto lejos, la heladera, tu respiración.\n\nY una cosa que podés oler. El aroma de la infusión, la almohada, lo que sea.\n\nMuy bien. Estás acá.\n\nAhora apoyá una mano en el pecho y otra en la panza. Inhalá por la nariz llevando el aire a la mano de la panza... y soltá largo por la boca. Otra vez. La mano del pecho casi no se mueve. La de la panza sube y baja.\n\nLa ansiedad es una ola. Sube... llega a un pico... y baja. Siempre baja. No hace falta hacer nada para que baje. Solo respirar mientras pasa.\n\nInhalá... y soltá.\n\nDecite, en silencio: \"esto es una sensación, no un peligro\". \"Esto va a pasar\". \"Estoy a salvo\".\n\nSeguí respirando con la mano en la panza.\n\nSi la angustia es muy fuerte o aparece seguido, hablalo con tu médico. Pedir ayuda es parte de cuidarte.\n\nPor esta noche, alcanza con esto: respirar, estar acá, y dejar que la ola baje.\n\nYa está bajando. Inhalá... y soltá.\n\nBuenas noches." },
    { n: 7, titulo: "Gratitud", para: "Para terminar el día con algo lindo y dormirte con la cabeza en calma.",
      guion: "Hola. Soy Claudia. Esta noche vamos a cerrar el día de otra manera. No con lo que faltó, sino con lo que hubo.\n\nRespirá hondo... y soltá.\n\nPensá en una cosa buena que te pasó hoy. No tiene que ser grande. Un mate rico. Un mensaje de alguien que querés. Un rato de sol. Quedate un momento con esa imagen. Sentí lo que sentiste.\n\nAhora pensá en algo que hiciste por vos hoy. Tomaste el licuado. Tomaste agua. Caminaste un poco. Te acostaste un rato más temprano. Lo que sea. Reconocelo. Eso lo hiciste vos.\n\nY ahora pensá en una persona. Alguien que te hace bien. Imaginá su cara. Mandale, en silencio, un gracias.\n\nRespirá... inhalá... y soltá.\n\nCuando terminás el día pensando en lo que salió bien, el cuerpo baja la guardia. El cortisol baja. Y la noche se vuelve tu aliada.\n\nMañana es un día nuevo. No tiene que ser perfecto. Solo un poquito mejor que hoy.\n\nCada noche que dormís bien, tu insulina baja, tu cuerpo repara y te despertás más liviana. Esto que estás haciendo está funcionando, aunque todavía no lo veas en el espejo.\n\nSentí el cuerpo pesado... tibio... tranquilo.\n\nGracias por cuidarte hoy. Buenas noches." }
  ],

  /* ---------- 4. La Cena que te Deja Dormir ---------- */
  cena: {
    titulo: "La Cena que te Deja Dormir",
    bajada: "Qué cenar y a qué hora para que la digestión no te despierte a las 3 de la mañana.",
    horario: "Cená entre 2 y 3 horas antes de acostarte. Si te acostás a las 23, la cena ideal es entre las 20 y las 21. Si un día cenás más tarde, que sea más liviana.",
    errores: [
      { t: "Cenar tarde y pesado", d: "Acostarte con la digestión a pleno sube la temperatura del cuerpo y te hace despertar. Y una cena grande de harinas te sube la insulina justo antes de dormir." },
      { t: "El postre dulce antes de acostarte", d: "El azúcar a la noche sube la glucosa, después la baja de golpe, y esa bajada te despierta de madrugada con el corazón acelerado o con hambre." },
      { t: "La pantalla en la mesa", d: "Comer mirando el celular o la tele hace que comas más rápido y más cantidad, y la luz frena la melatonina." }
    ],
    plato: "En la cena también vale el orden del plato: primero la verdura, después la proteína y al final, si hay, el carbohidrato. Una porción chica de carbohidrato a la noche (media papa, un poco de arroz, una tostada) ayuda a dormir; lo que no ayuda es la montaña de fideos.",
    platos: [
      { n: "Sopa crema de calabaza con huevo duro", p: "Liviana, tibia, y el huevo aporta proteína para que no te despierte el hambre." },
      { n: "Merluza a la plancha con puré de calabaza", p: "El pescado es fácil de digerir y la calabaza es reconfortante." },
      { n: "Omelette de verduras con ensalada", p: "Lista en 10 minutos. Proteína completa y nada pesado." },
      { n: "Pollo al horno con zapallitos y media papa", p: "La porción chica de papa a la noche ayuda a dormir sin subir la insulina de más." },
      { n: "Tarta de verdura sin tapa con ensalada", p: "Una porción con la masa de abajo sola; las verduras, todas las que quieras." },
      { n: "Caldo de verduras con pollo desmenuzado", p: "Ideal después de un día de mucha comida o de panza hinchada." },
      { n: "Revuelto de zapallitos con queso fresco", p: "Simple, económico, y el queso aporta triptófano." },
      { n: "Ensalada tibia de lentejas con verduras", p: "Fibra y proteína vegetal: el azúcar entra despacio y no te despertás." },
      { n: "Atún o caballa al natural con ensalada completa y huevo", p: "Para las noches sin ganas de cocinar." },
      { n: "Calabaza rellena con ricota y espinaca", p: "Rica, llenadora y suave para la digestión." }
    ],
    despertar: {
      titulo: "Si igual te despertás",
      pasos: ["No mires la hora ni el celular.", "Un sorbo de agua y respiración 4-7-8, cuatro veces.", "Si es hambre de verdad: unas pocas almendras o nueces, y la próxima vez sumá proteína a la cena.", "Si después de un rato seguís despierta, poné el audio 5, \"Si te despertás a las 3\"."]
    }
  },

  /* ---------- 5. El Plan de 21 Noches ---------- */
  semanas: ["Semana 1 · Calmar", "Semana 2 · Regular", "Semana 3 · Sostener"],
  focos: [
    "Esta noche solo probá el ritual completo, sin exigirte. Fijate cuánto tardás.",
    "Elegí tu hora de acostarte y respetala toda la semana, también el fin de semana.",
    "Celular afuera del cuarto o en modo avión desde el paso 1.",
    "Si te cuesta dormirte, sumá la respiración 4-7-8 dos veces.",
    "Revisá la cena: ¿terminaste 2 horas antes de acostarte?",
    "Viernes: si salís o cenás afuera, hacé al menos la versión de 10 minutos.",
    "Repasá la semana: ¿qué noche dormiste mejor? Repetí lo que hiciste.",
    "Semana 2: empezamos a regular el reloj. Levantate a la misma hora todos los días.",
    "Tomá un rato de luz natural a la mañana: ayuda a dormirte de noche.",
    "Cero café después de las 16 h.",
    "Si te despertás a la madrugada, usá el audio 5 en vez de mirar el celular.",
    "Probá cenar 15 minutos antes que de costumbre.",
    "Fin de semana: misma hora de acostarte, aunque sea más tarde, con margen de una hora.",
    "Mirá tu evolución: ¿te levantás menos hinchada que en la semana 1?",
    "Semana 3: sostener. El ritual ya es un hábito; hacelo sin mirar la app.",
    "Noche de gratitud: escuchá el audio 7 aunque no te toque.",
    "Si una noche se te pasa, no compenses: mañana volvés al ritual y listo.",
    "Probá dormir con el cuarto bien oscuro y un poco fresco.",
    "Elegí tus 3 cosas del ritual que no vas a dejar nunca.",
    "Fin de semana largo o salida: versión de 10 minutos y a la cama.",
    "Última noche del plan. Lo que hacés de día ya no se pierde de noche. Seguí así 💛"
  ]
};
