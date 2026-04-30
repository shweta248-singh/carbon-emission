module.exports = {
  definitions: {
    inventory: {
      en: "Inventory refers to the raw materials, work-in-progress goods and completely finished goods that are considered to be the portion of a business's assets that are ready or will be ready for sale.",
      hi: "इन्वेंट्री से तात्पर्य कच्चे माल, प्रगति पर काम करने वाले सामान और पूरी तरह से तैयार माल से है जिसे व्यवसाय की संपत्ति का वह हिस्सा माना जाता है जो बिक्री के लिए तैयार है या तैयार होगा।",
      es: "El inventario se refiere a las materias primas, los bienes en proceso y los productos terminados que se consideran la parte de los activos de una empresa que están listos o estarán listos para la venta."
    },
    shipment: {
      en: "A shipment is the act of transporting goods, or the goods themselves being transported from one location to another, typically from a warehouse to a customer or another business node.",
      hi: "शिपमेंट माल के परिवहन का कार्य है, या माल स्वयं एक स्थान से दूसरे स्थान पर ले जाया जा रहा है, आमतौर पर एक गोदाम से ग्राहक या किसी अन्य व्यावसायिक नोड तक।",
      es: "Un envío es el acto de transportar bienes, o los bienes mismos que se transportan de un lugar a otro, generalmente desde un almacén a un cliente u otro nodo comercial."
    },
    sku: {
      en: "SKU stands for Stock Keeping Unit. It is a unique code used to identify and track inventory items.",
      hi: "SKU का मतलब स्टॉक कीपिंग यूनिट है। यह एक अद्वितीय कोड है जिसका उपयोग इन्वेंट्री आइटम की पहचान करने और ट्रैक करने के लिए किया जाता है।",
      es: "SKU significa Unidad de Mantenimiento de Existencias (Stock Keeping Unit). Es un código único utilizado para identificar y rastrear artículos de inventario."
    },
    warehouse: {
      en: "A warehouse is a building for storing goods. In CarbonTrace, you can manage multiple warehouses and their specific locations.",
      hi: "गोदाम माल के भंडारण के लिए एक इमारत है। CarbonTrace में, आप कई गोदामों और उनके विशिष्ट स्थानों का प्रबंधन कर सकते हैं।",
      es: "Un almacén es un edificio para almacenar mercancías. En CarbonTrace, puede administrar múltiples almacenes y sus ubicaciones específicas."
    },
    carbon_emission: {
      en: "Carbon emissions in logistics are calculated based on distance traveled, vehicle type, fuel efficiency, and weight of the cargo. Formula: Distance (km) * Emission Factor (kg CO2/km).",
      hi: "लॉजिस्टिक्स में कार्बन उत्सर्जन की गणना तय की गई दूरी, वाहन के प्रकार, ईंधन दक्षता और कार्गो के वजन के आधार पर की जाती है। फॉर्मूला: दूरी (किमी) * उत्सर्जन कारक (किग्रा CO2/किमी)।",
      es: "Las emisiones de carbono en logística se calculan en función de la distancia recorrida, el tipo de vehículo, la eficiencia del combustible y el peso de la carga. Fórmula: Distancia (km) * Factor de emisión (kg CO2/km)."
    },
    vehicles: {
      en: "CarbonTrace supports 12 vehicle types: Car, Bike, Truck, Mini Truck, Van, Electric Van, Pickup, Rail, Ship, Air Cargo, EV Truck, and Container Truck. Each has a specific emission factor, with Ship and Rail being among the most eco-friendly.",
      hi: "CarbonTrace 12 वाहन प्रकारों का समर्थन करता है: कार, बाइक, ट्रक, मिनी ट्रक, वैन, इलेक्ट्रिक वैन, पिकअप, रेल, जहाज, एयर कार्गो, ईवी ट्रक और कंटेनर ट्रक। प्रत्येक का एक विशिष्ट उत्सर्जन कारक है, जिसमें जहाज और रेल सबसे अधिक पर्यावरण के अनुकूल हैं।",
      es: "CarbonTrace admite 12 tipos de vehículos: Coche, Bicicleta, Camión, Minicamión, Furgoneta, Furgoneta Eléctrica, Camioneta, Ferrocarril, Barco, Carga Aérea, Camión Eléctrico y Camión de Contenedores. Cada uno tiene un factor de emisión específico, siendo el barco y el ferrocarril los más ecológicos."
    }
  },
  features: {
    operations_hub: {
      en: "Operations Hub is the central place to manage your daily logistics, add products, and create shipments.",
      hi: "ऑपरेशन हब आपके दैनिक लॉजिस्टिक्स के प्रबंधन, उत्पाद जोड़ने और शिपमेंट बनाने का केंद्रीय स्थान है।",
      es: "Operations Hub es el lugar central para gestionar su logística diaria, agregar productos y crear envíos."
    },
    analytics: {
      en: "Analytics provides deep insights into your sustainability performance, showing trends in carbon savings and transport efficiency.",
      hi: "एनालिटिक्स आपके स्थिरता प्रदर्शन में गहरी अंतर्दृष्टि प्रदान करता है, कार्बन बचत और परिवहन दक्षता में रुझान दिखाता है।",
      es: "Analytics proporciona información profunda sobre su desempeño en sostenibilidad, mostrando tendencias en ahorros de carbono y eficiencia en el transporte."
    },
    route_optimization: {
      en: "Route Optimization helps you find the most eco-friendly transport mode for your routes, recommending shifts from high-emission vehicles to cleaner alternatives like rail or EV trucks.",
      hi: "रूट अनुकूलन आपको अपने मार्गों के लिए सबसे अधिक पर्यावरण के अनुकूल परिवहन मोड खोजने में मदद करता है, उच्च-उत्सर्जन वाहनों से रेल या ईवी ट्रकों जैसे स्वच्छ विकल्पों में बदलाव की सिफारिश करता है।",
      es: "La optimización de rutas lo ayuda a encontrar el modo de transporte más ecológico para sus rutas, recomendando cambios de vehículos de altas emisiones a alternativas más limpias como trenes o camiones eléctricos."
    }
  },
  examples: {
    inventory: {
      en: "Product Name: Organic Rice Bag 25kg, SKU: RICE-001, Quantity: 150, Warehouse: Lucknow Warehouse A, Category: Food Grains",
      hi: "उत्पाद का नाम: ऑर्गेनिक चावल का बैग 25 किलो, SKU: RICE-001, मात्रा: 150, गोदाम: लखनऊ वेयरहाउस ए, श्रेणी: अनाज",
      es: "Nombre del producto: Bolsa de arroz orgánico 25 kg, SKU: RICE-001, Cantidad: 150, Almacén: Almacén de Madrid A, Categoría: Granos de comida"
    },
    shipment: {
      en: "Origin: Mumbai, Destination: Delhi, Distance: 1400km, Vehicle: Truck, Item: RICE-001",
      hi: "स्रोत: मुंबई, गंतव्य: दिल्ली, दूरी: 1400 किमी, वाहन: ट्रक, आइटम: RICE-001",
      es: "Origen: Barcelona, Destino: Madrid, Distancia: 600km, Vehículo: Camión, Artículo: RICE-001"
    }
  },
  unrelated_reply: {
    en: "I can only answer questions related to CarbonTrace supply chain management.",
    hi: "मैं केवल CarbonTrace आपूर्ति श्रृंखला प्रबंधन से संबंधित प्रश्नों के उत्तर दे सकता हूँ।",
    es: "Solo puedo responder preguntas relacionadas con la gestión de la cadena de suministro de CarbonTrace."
  },
  low_confidence_reply: {
    en: "I am not confident enough. Please ask a CarbonTrace-related question.",
    hi: "मैं पर्याप्त आश्वस्त नहीं हूँ। कृपया CarbonTrace से संबंधित प्रश्न पूछें।",
    es: "No tengo la suficiente confianza. Por favor, haga una pregunta relacionada con CarbonTrace."
  }
};
