const TRIP_DATA = {
  title: "Annecy 2026",
  days: [
    {
      id: "day1",
      date: "2026-06-17",
      label: "Day 1",
      title: "Home to Amiens",
      subtitle: "Cross-Channel via LeShuttle",
      stops: [
        { id:"d1s1", order:1, time:"10:30", tz:"UK", location:"North Cadbury, Somerset", type:"depart", priority:0, lat:51.0333, lng:-2.5333, mapsUrl:"https://maps.google.com/?q=North+Cadbury+Somerset", reason:"Leave home.", icon:"🏠" },
        { id:"d1s2", order:2, time:"13:15", tz:"UK", location:"Tesla Supercharger Folkestone", type:"charging", priority:0, lat:51.0882, lng:1.1728, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Folkestone", reason:"Charge to 90–95%, coffee, toilets and relax before crossing.", icon:"⚡" },
        { id:"d1s3", order:3, time:"14:15", tz:"UK", location:"LeShuttle Check-In, Folkestone", type:"transport", priority:0, lat:51.0940, lng:1.1430, mapsUrl:"https://maps.google.com/?q=LeShuttle+Folkestone+Terminal", reason:"Arrive 90 minutes before departure.", icon:"🚂" },
        { id:"d1s4", order:4, time:"15:46", tz:"UK", location:"LeShuttle Departure", type:"transport", priority:0, lat:51.0940, lng:1.1430, mapsUrl:"https://maps.google.com/?q=LeShuttle+Folkestone+Terminal", reason:"Channel Tunnel crossing.", icon:"🚂" },
        { id:"d1s5", order:5, time:"17:21", tz:"FR", location:"LeShuttle Arrival, Calais", type:"transport", priority:0, lat:50.9513, lng:1.8587, mapsUrl:"https://maps.google.com/?q=LeShuttle+Calais+Terminal", reason:"Arrive in France.", icon:"🇫🇷" },
        { id:"d1s6", order:6, time:"18:30", tz:"FR", location:"Saint-Valery-sur-Somme", type:"town", priority:3, lat:50.1833, lng:1.6333, mapsUrl:"https://maps.google.com/?q=Saint-Valery-sur-Somme", reason:"First proper French stop with harbour, old town, artists and evening atmosphere.", icon:"⚓" },
        { id:"d1s7", order:7, time:"18:35", tz:"FR", location:"Old Harbour, Saint-Valery", type:"wander", priority:3, lat:50.1821, lng:1.6298, mapsUrl:"https://maps.google.com/?q=Port+de+Saint-Valery-sur-Somme", reason:"Harbour views, fishing boats and sunset.", icon:"🌅" },
        { id:"d1s8", order:8, time:"18:50", tz:"FR", location:"Medieval Old Town, Saint-Valery", type:"architecture", priority:3, lat:50.1850, lng:1.6350, mapsUrl:"https://maps.google.com/?q=Vieille+Ville+Saint-Valery-sur-Somme", reason:"Historic streets and ramparts overlooking the bay.", icon:"🏰" },
        { id:"d1s9", order:9, time:"19:00", tz:"FR", location:"Independent Café, Saint-Valery", type:"food", priority:2, lat:50.1833, lng:1.6333, mapsUrl:"https://maps.google.com/?q=cafe+Saint-Valery-sur-Somme", reason:"Choose whichever independent café looks most appealing.", icon:"☕", veganFriendly:true },
        { id:"d1s10", order:10, time:"20:00", tz:"FR", location:"Depart Saint-Valery", type:"depart", priority:0, lat:50.1833, lng:1.6333, mapsUrl:"https://maps.google.com/?q=Saint-Valery-sur-Somme", reason:"Continue to Amiens.", icon:"🚗" },
        { id:"d1s11", order:11, time:"20:30", tz:"FR", location:"Tesla Supercharger Dury (Amiens)", type:"charging", priority:0, lat:49.8390, lng:2.2870, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Dury+Amiens", reason:"Top up for tomorrow while grabbing snacks if needed.", icon:"⚡" },
        { id:"d1s12", order:12, time:"20:50", tz:"FR", location:"Moxy Amiens", type:"hotel", priority:0, lat:49.8941, lng:2.2958, mapsUrl:"https://maps.google.com/?q=Moxy+Amiens", reason:"Check-in and drop bags.", icon:"🏨" },
        { id:"d1s13", order:13, time:"21:05", tz:"FR", location:"Amiens Cathedral", type:"architecture", priority:3, lat:49.8942, lng:2.3019, mapsUrl:"https://maps.google.com/?q=Cathedrale+Notre-Dame+d+Amiens", reason:"Stunning evening views and a perfect first-night stroll.", icon:"⛪" },
        { id:"d1s14", order:14, time:"21:30", tz:"FR", location:"Dinner, Central Amiens", type:"food", priority:2, lat:49.8942, lng:2.3020, mapsUrl:"https://maps.google.com/?q=vegan+restaurant+Amiens", reason:"Find dinner and enjoy the atmosphere of the city.", icon:"🍽️", veganFriendly:true },
        { id:"d1s15", order:15, time:"22:30", tz:"FR", location:"Moxy Amiens", type:"hotel", priority:0, lat:49.8941, lng:2.2958, mapsUrl:"https://maps.google.com/?q=Moxy+Amiens", reason:"Overnight stay.", icon:"🛏️" }
      ]
    },
    {
      id: "day2",
      date: "2026-06-18",
      label: "Day 2",
      title: "Amiens to Troyes",
      subtitle: "Floating gardens, roses & timber frames",
      stops: [
        { id:"d2s1", order:1, time:"08:00", tz:"FR", location:"Moxy Amiens", type:"depart", priority:0, lat:49.8941, lng:2.2958, mapsUrl:"https://maps.google.com/?q=Moxy+Amiens", reason:"Breakfast and checkout.", icon:"🏨" },
        { id:"d2s2", order:2, time:"08:20", tz:"FR", location:"Hortillonnages d'Amiens", type:"experience", priority:3, lat:49.8978, lng:2.3138, mapsUrl:"https://maps.google.com/?q=Hortillonnages+Amiens", reason:"One of the most unique landscapes in France — canals, floating gardens and wildlife.", icon:"🌿" },
        { id:"d2s3", order:3, time:"08:30", tz:"FR", location:"Hortillonnages Boat Tour & Walk", type:"experience", priority:3, lat:49.8978, lng:2.3138, mapsUrl:"https://maps.google.com/?q=Hortillonnages+Amiens", reason:"Explore the floating islands by boat and on foot.", icon:"🚣", duration:120 },
        { id:"d2s4", order:4, time:"10:30", tz:"FR", location:"Coffee Stop, Amiens", type:"food", priority:2, lat:49.8942, lng:2.3020, mapsUrl:"https://maps.google.com/?q=coffee+Amiens+France", reason:"Coffee and pastry before heading south.", icon:"☕", veganFriendly:true },
        { id:"d2s5", order:5, time:"11:00", tz:"FR", location:"Depart Amiens", type:"depart", priority:0, lat:49.8942, lng:2.3020, mapsUrl:"https://maps.google.com/?q=Amiens", reason:"Head towards Gerberoy.", icon:"🚗" },
        { id:"d2s6", order:6, time:"12:15", tz:"FR", location:"Gerberoy", type:"village", priority:3, lat:49.4853, lng:1.8239, mapsUrl:"https://maps.google.com/?q=Gerberoy+France", reason:"One of France's most beautiful villages with roses, artists and medieval streets.", icon:"🌹" },
        { id:"d2s7", order:7, time:"12:15", tz:"FR", location:"Gerberoy Wander & Lunch", type:"food", priority:3, lat:49.4853, lng:1.8239, mapsUrl:"https://maps.google.com/?q=Gerberoy+France", reason:"Explore the lanes, gardens and artisan shops, then lunch.", icon:"🍽️", duration:90, veganFriendly:true },
        { id:"d2s8", order:8, time:"13:45", tz:"FR", location:"Depart Gerberoy", type:"depart", priority:0, lat:49.4853, lng:1.8239, mapsUrl:"https://maps.google.com/?q=Gerberoy+France", reason:"Continue towards Troyes.", icon:"🚗" },
        { id:"d2s9", order:9, time:"15:45", tz:"FR", location:"Tesla Supercharger Troyes", type:"charging", priority:0, lat:48.3135, lng:4.1020, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Pont-Sainte-Marie+France", reason:"Charge, coffee and comfort break before the evening.", icon:"⚡" },
        { id:"d2s10", order:10, time:"16:30", tz:"FR", location:"Troyes Old Town", type:"architecture", priority:3, lat:48.2973, lng:4.0744, mapsUrl:"https://maps.google.com/?q=Troyes+France", reason:"One of the finest collections of half-timbered buildings in France.", icon:"🏘️" },
        { id:"d2s11", order:11, time:"16:45", tz:"FR", location:"Ruelle des Chats, Troyes", type:"architecture", priority:3, lat:48.2968, lng:4.0735, mapsUrl:"https://maps.google.com/?q=Ruelle+des+Chats+Troyes", reason:"Famous medieval lane with leaning timber-framed buildings.", icon:"🏛️" },
        { id:"d2s12", order:12, time:"17:15", tz:"FR", location:"Cathedral Area, Troyes", type:"architecture", priority:2, lat:48.2995, lng:4.0781, mapsUrl:"https://maps.google.com/?q=Cathedrale+Saint-Pierre-et-Saint-Paul+de+Troyes", reason:"Beautiful Gothic architecture and stained glass.", icon:"⛪" },
        { id:"d2s13", order:13, time:"17:45", tz:"FR", location:"Café La Fiancée, Troyes", type:"food", priority:2, lat:48.2975, lng:4.0745, mapsUrl:"https://maps.google.com/?q=Cafe+La+Fiancee+Troyes", reason:"Speciality coffee and vegan-friendly options.", icon:"☕", veganFriendly:true },
        { id:"d2s14", order:14, time:"18:30", tz:"FR", location:"Evening Wander, Troyes Old Town", type:"wander", priority:3, lat:48.2973, lng:4.0744, mapsUrl:"https://maps.google.com/?q=Centre+Historique+de+Troyes", reason:"Enjoy the old town as it quietens down in the evening.", icon:"🌆" },
        { id:"d2s15", order:15, time:"19:30", tz:"FR", location:"Dinner, Troyes", type:"food", priority:2, lat:48.2973, lng:4.0744, mapsUrl:"https://maps.google.com/?q=vegan+restaurant+Troyes+France", reason:"Relaxed evening meal.", icon:"🍽️", veganFriendly:true },
        { id:"d2s16", order:16, time:"21:00", tz:"FR", location:"B&B HOTEL Troyes Centre", type:"hotel", priority:0, lat:48.2990, lng:4.0760, mapsUrl:"https://maps.google.com/?q=B%26B+HOTEL+Troyes+Centre", reason:"Overnight stay.", icon:"🛏️" }
      ]
    },
    {
      id: "day3",
      date: "2026-06-19",
      label: "Day 3",
      title: "Troyes to Beaune",
      subtitle: "Burgundy villages & the wine route",
      stops: [
        { id:"d3s1", order:1, time:"08:00", tz:"FR", location:"B&B HOTEL Troyes Centre", type:"depart", priority:0, lat:48.2990, lng:4.0760, mapsUrl:"https://maps.google.com/?q=B%26B+HOTEL+Troyes+Centre", reason:"Breakfast and checkout.", icon:"🏨" },
        { id:"d3s2", order:2, time:"08:45", tz:"FR", location:"Flavigny-sur-Ozerain", type:"village", priority:3, lat:47.5167, lng:4.5333, mapsUrl:"https://maps.google.com/?q=Flavigny-sur-Ozerain", reason:"One of the prettiest villages in France with medieval streets and artisan shops.", icon:"🌸" },
        { id:"d3s3", order:3, time:"08:45", tz:"FR", location:"Flavigny Wander", type:"wander", priority:3, lat:47.5167, lng:4.5333, mapsUrl:"https://maps.google.com/?q=Flavigny-sur-Ozerain", reason:"Explore the lanes, viewpoints and famous anise sweet workshops.", icon:"🍬", duration:90 },
        { id:"d3s4", order:4, time:"10:30", tz:"FR", location:"Abbey of Fontenay", type:"architecture", priority:3, lat:47.6378, lng:4.3992, mapsUrl:"https://maps.google.com/?q=Abbaye+de+Fontenay", reason:"UNESCO-listed abbey with beautiful gardens and peaceful surroundings.", icon:"🏛️" },
        { id:"d3s5", order:5, time:"10:30", tz:"FR", location:"Fontenay Abbey", type:"experience", priority:3, lat:47.6378, lng:4.3992, mapsUrl:"https://maps.google.com/?q=Abbaye+de+Fontenay", reason:"Historic buildings, landscaped grounds and workshops.", icon:"🌿", duration:90 },
        { id:"d3s6", order:6, time:"12:30", tz:"FR", location:"Semur-en-Auxois", type:"town", priority:3, lat:47.4833, lng:4.3333, mapsUrl:"https://maps.google.com/?q=Semur-en-Auxois", reason:"One of Burgundy's most photogenic medieval towns.", icon:"🏰" },
        { id:"d3s7", order:7, time:"12:30", tz:"FR", location:"Lunch & Wander, Semur-en-Auxois", type:"food", priority:3, lat:47.4833, lng:4.3333, mapsUrl:"https://maps.google.com/?q=Semur-en-Auxois", reason:"Lunch, coffee and explore bridges, towers and riverside views.", icon:"🍽️", duration:90, veganFriendly:true },
        { id:"d3s8", order:8, time:"15:00", tz:"FR", location:"Clos de Vougeot", type:"historic", priority:3, lat:47.1667, lng:4.9500, mapsUrl:"https://maps.google.com/?q=Clos+de+Vougeot", reason:"Historic château surrounded by world-famous vineyards.", icon:"🍷" },
        { id:"d3s9", order:9, time:"15:30", tz:"FR", location:"Route des Grands Crus", type:"scenic", priority:3, lat:47.2000, lng:4.9500, mapsUrl:"https://maps.google.com/?q=Route+des+Grands+Crus+Bourgogne", reason:"One of France's most scenic drives through vineyard country.", icon:"🛣️" },
        { id:"d3s10", order:10, time:"16:00", tz:"FR", location:"Vosne-Romanée", type:"village", priority:2, lat:47.1667, lng:4.9667, mapsUrl:"https://maps.google.com/?q=Vosne-Romanee+France", reason:"Elegant wine village with beautiful surroundings.", icon:"🍇" },
        { id:"d3s11", order:11, time:"16:45", tz:"FR", location:"St-Romain", type:"village", priority:3, lat:46.9833, lng:4.7833, mapsUrl:"https://maps.google.com/?q=Saint-Romain+Bourgogne", reason:"Hidden village beneath dramatic limestone cliffs.", icon:"🪨" },
        { id:"d3s12", order:12, time:"17:15", tz:"FR", location:"Monthélie", type:"village", priority:2, lat:46.9833, lng:4.8000, mapsUrl:"https://maps.google.com/?q=Monthelie+France", reason:"Quiet vineyard village largely untouched by tourism.", icon:"🌾" },
        { id:"d3s13", order:13, time:"17:30", tz:"FR", location:"Auxey-Duresses", type:"village", priority:2, lat:46.9833, lng:4.7833, mapsUrl:"https://maps.google.com/?q=Auxey-Duresses+France", reason:"Traditional stone houses and vineyard scenery.", icon:"🏡" },
        { id:"d3s14", order:14, time:"18:00", tz:"FR", location:"Tesla Supercharger Beaune", type:"charging", priority:0, lat:47.0167, lng:4.8400, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Beaune", reason:"Top up before the evening.", icon:"⚡" },
        { id:"d3s15", order:15, time:"18:30", tz:"FR", location:"Beaune Old Town", type:"architecture", priority:3, lat:47.0200, lng:4.8380, mapsUrl:"https://maps.google.com/?q=Hospices+de+Beaune", reason:"Historic centre, beautiful buildings and evening atmosphere.", icon:"🏛️" },
        { id:"d3s16", order:16, time:"19:00", tz:"FR", location:"Dinner, Beaune", type:"food", priority:2, lat:47.0200, lng:4.8380, mapsUrl:"https://maps.google.com/?q=vegan+restaurant+Beaune+France", reason:"Relaxed final evening before Annecy.", icon:"🍽️", veganFriendly:true },
        { id:"d3s17", order:17, time:"21:00", tz:"FR", location:"ibis Styles Beaune Centre", type:"hotel", priority:0, lat:47.0230, lng:4.8370, mapsUrl:"https://maps.google.com/?q=ibis+Styles+Beaune+Centre", reason:"Overnight stay.", icon:"🛏️" }
      ]
    },
    {
      id: "day4",
      date: "2026-06-20",
      label: "Day 4",
      title: "Beaune to Annecy",
      subtitle: "Into the Alps — festival begins",
      stops: [
        { id:"d4s1", order:1, time:"08:00", tz:"FR", location:"ibis Styles Beaune Centre", type:"depart", priority:0, lat:47.0230, lng:4.8370, mapsUrl:"https://maps.google.com/?q=ibis+Styles+Beaune+Centre", reason:"Breakfast and checkout.", icon:"🏨" },
        { id:"d4s2", order:2, time:"08:15", tz:"FR", location:"Depart Beaune", type:"depart", priority:0, lat:47.0200, lng:4.8380, mapsUrl:"https://maps.google.com/?q=Beaune+France", reason:"Head towards the Alps.", icon:"🚗" },
        { id:"d4s3", order:3, time:"10:15", tz:"FR", location:"Cité Médiévale de Conflans, Albertville", type:"town", priority:3, lat:45.6790, lng:6.3940, mapsUrl:"https://maps.google.com/?q=Cite+Medievale+de+Conflans+Albertville", reason:"Hilltop medieval town with mountain views, cafés and architecture.", icon:"⛰️" },
        { id:"d4s4", order:4, time:"10:15", tz:"FR", location:"Coffee & Wander, Conflans", type:"wander", priority:3, lat:45.6790, lng:6.3940, mapsUrl:"https://maps.google.com/?q=Cite+Medievale+de+Conflans+Albertville", reason:"Final scenic stop before Annecy.", icon:"☕", duration:60 },
        { id:"d4s5", order:5, time:"11:15", tz:"FR", location:"Depart Conflans", type:"depart", priority:0, lat:45.6790, lng:6.3940, mapsUrl:"https://maps.google.com/?q=Albertville+France", reason:"Continue towards Annecy.", icon:"🚗" },
        { id:"d4s6", order:6, time:"11:45", tz:"FR", location:"Tesla Supercharger Annecy-Seynod", type:"charging", priority:0, lat:45.8833, lng:6.1000, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Annecy+Seynod", reason:"Charge to 90–95% for festival week and Geneva Airport pickup later.", icon:"⚡", duration:30 },
        { id:"d4s7", order:7, time:"12:30", tz:"FR", location:"Chalet de Charme avec Vue Splendide", type:"hotel", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l+Arete+74290+Menthon-Saint-Bernard", reason:"Arrive around lunchtime, unpack and settle in.", icon:"🏔️" },
        { id:"d4s8", order:8, time:"17:00", tz:"FR", location:"Geneva Airport — French Side", type:"transport", priority:0, lat:46.2380, lng:6.1090, mapsUrl:"https://maps.app.goo.gl/dk7AWyRJgz6aAfdp7", reason:"Collect family with plenty of battery remaining.", icon:"✈️" }
      ]
    },
    {
      id: "festival",
      date: "2026-06-20",
      dateEnd: "2026-06-27",
      label: "Festival",
      title: "Annecy Festival Week",
      subtitle: "International Animation Film Festival 2026",
      isFestival: true,
      stops: [
        { id:"fs1", order:1, time:"All week", tz:"FR", location:"Annecy Town Centre", type:"festival", priority:3, lat:45.8992, lng:6.1294, mapsUrl:"https://maps.google.com/?q=Annecy+France", reason:"International Animation Film Festival 2026 — screenings, exhibitions and events throughout the town.", icon:"🎬" },
        { id:"fs2", order:2, time:"Daily", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"hotel", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l+Arete+74290+Menthon-Saint-Bernard", reason:"Base for the week. Views over Lake Annecy.", icon:"🏔️" },
        { id:"fs3", order:3, time:"Daily", tz:"FR", location:"Lake Annecy", type:"experience", priority:3, lat:45.8667, lng:6.1833, mapsUrl:"https://maps.google.com/?q=Lac+Annecy", reason:"Swimming, cycling and boat trips on one of Europe's clearest lakes.", icon:"🏊" },
        { id:"fs4", order:4, time:"Daily", tz:"FR", location:"Annecy Old Town", type:"wander", priority:3, lat:45.8992, lng:6.1294, mapsUrl:"https://maps.google.com/?q=Vieille+Ville+Annecy", reason:"Canals, colourful buildings and the Palais de l'Isle.", icon:"🏛️" },
        { id:"fs5", order:5, time:"Daily", tz:"FR", location:"Château d'Annecy", type:"architecture", priority:2, lat:45.9004, lng:6.1279, mapsUrl:"https://maps.google.com/?q=Chateau+d+Annecy", reason:"Hilltop castle with panoramic views over the lake.", icon:"🏰" },
        { id:"fs6", order:6, time:"Nearby", tz:"FR", location:"Gorges du Fier", type:"experience", priority:2, lat:45.9167, lng:6.0333, mapsUrl:"https://maps.google.com/?q=Gorges+du+Fier+Lovagny", reason:"Spectacular narrow gorge with suspended walkways.", icon:"🌊" },
        { id:"fs7", order:7, time:"Nearby", tz:"FR", location:"Château de Menthon-Saint-Bernard", type:"architecture", priority:3, lat:45.8566, lng:6.2037, mapsUrl:"https://maps.google.com/?q=Chateau+de+Menthon-Saint-Bernard", reason:"Fairytale château right next to your chalet, said to have inspired Sleeping Beauty.", icon:"🏰" },
        { id:"fs8", order:8, time:"Nearby", tz:"FR", location:"Talloires", type:"village", priority:3, lat:45.8311, lng:6.2178, mapsUrl:"https://maps.google.com/?q=Talloires+France", reason:"Stunning village on the lake shore with cafés and abbey gardens.", icon:"⛵" },
        { id:"fs9", order:9, time:"Nearby", tz:"FR", location:"Vegan & Plant-Based Restaurants, Annecy", type:"food", priority:2, lat:45.8992, lng:6.1294, mapsUrl:"https://www.happycow.net/europe/france/annecy/", reason:"Several vegan-friendly spots in town including Le Green Café and others near the festival venues.", icon:"🌱", veganFriendly:true }
      ]
    },
    {
      id: "day5",
      date: "2026-06-27",
      label: "Day 5",
      title: "Annecy to Besançon",
      subtitle: "UNESCO salt works & riverside city",
      stops: [
        { id:"d5s1", order:1, time:"09:00", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"depart", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l+Arete+74290+Menthon-Saint-Bernard", reason:"Leave after breakfast and begin return journey.", icon:"🏔️" },
        { id:"d5s2", order:2, time:"11:30", tz:"FR", location:"Saline Royale d'Arc-et-Senans", type:"architecture", priority:3, lat:47.0333, lng:5.7833, mapsUrl:"https://maps.google.com/?q=Saline+Royale+d+Arc-et-Senans", reason:"Extraordinary UNESCO industrial architecture unlike anything else on the trip.", icon:"🏛️" },
        { id:"d5s3", order:3, time:"11:30", tz:"FR", location:"Saline Royale — Gardens & Buildings", type:"experience", priority:3, lat:47.0333, lng:5.7833, mapsUrl:"https://maps.google.com/?q=Saline+Royale+d+Arc-et-Senans", reason:"Explore the buildings, gardens and exhibitions.", icon:"🌿", duration:120 },
        { id:"d5s4", order:4, time:"13:30", tz:"FR", location:"Lunch, Arc-et-Senans", type:"food", priority:2, lat:47.0333, lng:5.7833, mapsUrl:"https://maps.google.com/?q=restaurant+Arc-et-Senans", reason:"Relaxed lunch stop before Besançon.", icon:"🍽️", veganFriendly:true },
        { id:"d5s5", order:5, time:"15:00", tz:"FR", location:"Tesla Supercharger Besançon", type:"charging", priority:0, lat:47.2378, lng:6.0241, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Besancon", reason:"Top up before hotel and evening exploring.", icon:"⚡" },
        { id:"d5s6", order:6, time:"15:30", tz:"FR", location:"Besançon Old Town", type:"architecture", priority:3, lat:47.2378, lng:6.0241, mapsUrl:"https://maps.google.com/?q=Besancon+France", reason:"Beautiful riverside city wrapped inside a loop of the River Doubs.", icon:"🏛️" },
        { id:"d5s7", order:7, time:"17:00", tz:"FR", location:"Citadel Viewpoints, Besançon", type:"experience", priority:3, lat:47.2358, lng:6.0320, mapsUrl:"https://maps.google.com/?q=Citadelle+de+Besancon", reason:"Superb views across the city and surrounding countryside.", icon:"👁️" },
        { id:"d5s8", order:8, time:"19:00", tz:"FR", location:"Dinner, Besançon", type:"food", priority:2, lat:47.2378, lng:6.0241, mapsUrl:"https://maps.google.com/?q=vegan+restaurant+Besancon+France", reason:"Enjoy the old town atmosphere.", icon:"🍽️", veganFriendly:true },
        { id:"d5s9", order:9, time:"21:00", tz:"FR", location:"B&B HOTEL Besançon Valentin", type:"hotel", priority:0, lat:47.2500, lng:6.0100, mapsUrl:"https://maps.app.goo.gl/kmEHshZWYuZJRMnx9", reason:"Overnight stay.", icon:"🛏️" }
      ]
    },
    {
      id: "day6",
      date: "2026-06-28",
      label: "Day 6",
      title: "Besançon to Rouen",
      subtitle: "Monet's Giverny & Gothic Rouen",
      stops: [
        { id:"d6s1", order:1, time:"08:30", tz:"FR", location:"Besançon Hotel", type:"depart", priority:0, lat:47.2500, lng:6.0100, mapsUrl:"https://maps.google.com/?q=Besancon+France", reason:"Breakfast and checkout.", icon:"🏨" },
        { id:"d6s2", order:2, time:"11:00", tz:"FR", location:"Tesla Supercharger Sens", type:"charging", priority:0, lat:48.1985, lng:3.2832, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Sens", reason:"Natural charging stop with coffee and facilities.", icon:"⚡" },
        { id:"d6s3", order:3, time:"13:00", tz:"FR", location:"Giverny", type:"experience", priority:3, lat:49.0754, lng:1.5339, mapsUrl:"https://maps.google.com/?q=Giverny+France", reason:"Monet's village and one of France's most famous garden destinations.", icon:"🌸" },
        { id:"d6s4", order:4, time:"13:00", tz:"FR", location:"Giverny Wander", type:"wander", priority:3, lat:49.0754, lng:1.5339, mapsUrl:"https://maps.google.com/?q=Giverny+France", reason:"Explore the village, gardens and riverside atmosphere.", icon:"🎨", duration:150 },
        { id:"d6s5", order:5, time:"17:00", tz:"FR", location:"Rouen Old Town", type:"architecture", priority:3, lat:49.4431, lng:1.0993, mapsUrl:"https://maps.google.com/?q=Rouen+France", reason:"One of France's most beautiful historic centres.", icon:"🏛️" },
        { id:"d6s6", order:6, time:"17:30", tz:"FR", location:"Rouen Cathedral", type:"architecture", priority:3, lat:49.4400, lng:1.0950, mapsUrl:"https://maps.google.com/?q=Cathedrale+Notre-Dame+de+Rouen", reason:"Extraordinary Gothic cathedral painted by Monet.", icon:"⛪" },
        { id:"d6s7", order:7, time:"19:00", tz:"FR", location:"Dinner, Rouen", type:"food", priority:2, lat:49.4431, lng:1.0993, mapsUrl:"https://maps.google.com/?q=vegan+restaurant+Rouen+France", reason:"Enjoy the evening atmosphere.", icon:"🍽️", veganFriendly:true },
        { id:"d6s8", order:8, time:"21:00", tz:"FR", location:"B&B HOTEL Rouen Centre Rive Droite", type:"hotel", priority:0, lat:49.4431, lng:1.0993, mapsUrl:"https://maps.app.goo.gl/PP7oKfUNM2C1a12T9", reason:"Overnight stay.", icon:"🛏️" }
      ]
    },
    {
      id: "day7",
      date: "2026-06-29",
      label: "Day 7",
      title: "Rouen to Home",
      subtitle: "Saint-Valery · LeShuttle · North Cadbury",
      stops: [
        { id:"d7s1", order:1, time:"08:30", tz:"FR", location:"B&B HOTEL Rouen Centre", type:"depart", priority:0, lat:49.4431, lng:1.0993, mapsUrl:"https://maps.google.com/?q=B%26B+HOTEL+Rouen+Centre", reason:"Breakfast and checkout.", icon:"🏨" },
        { id:"d7s2", order:2, time:"10:30", tz:"FR", location:"Saint-Valery-sur-Somme", type:"town", priority:3, lat:50.1833, lng:1.6333, mapsUrl:"https://maps.google.com/?q=Saint-Valery-sur-Somme", reason:"Proper visit to the harbour town we only briefly glimpsed on the outbound trip.", icon:"⚓" },
        { id:"d7s3", order:3, time:"10:30", tz:"FR", location:"Harbour & Old Town, Saint-Valery", type:"wander", priority:3, lat:50.1833, lng:1.6333, mapsUrl:"https://maps.google.com/?q=Saint-Valery-sur-Somme", reason:"Harbour, medieval streets, coffee and people watching.", icon:"🌅", duration:120 },
        { id:"d7s4", order:4, time:"12:30", tz:"FR", location:"Lunch, Saint-Valery-sur-Somme", type:"food", priority:2, lat:50.1833, lng:1.6333, mapsUrl:"https://maps.google.com/?q=restaurant+Saint-Valery-sur-Somme", reason:"Final relaxed French lunch.", icon:"🍽️", veganFriendly:true },
        { id:"d7s5", order:5, time:"13:30", tz:"FR", location:"Tesla Supercharger Coquelles", type:"charging", priority:0, lat:50.9283, lng:1.8167, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Coquelles", reason:"Final charge before crossing.", icon:"⚡" },
        { id:"d7s6", order:6, time:"14:30", tz:"FR", location:"LeShuttle Check-In, Calais", type:"transport", priority:0, lat:50.9513, lng:1.8587, mapsUrl:"https://maps.google.com/?q=LeShuttle+Calais+Terminal", reason:"Arrive one hour before departure.", icon:"🚂" },
        { id:"d7s7", order:7, time:"15:36", tz:"FR", location:"LeShuttle Departure", type:"transport", priority:0, lat:50.9513, lng:1.8587, mapsUrl:"https://maps.google.com/?q=LeShuttle+Calais+Terminal", reason:"Return crossing.", icon:"🚂" },
        { id:"d7s8", order:8, time:"15:11", tz:"UK", location:"Folkestone Arrival", type:"transport", priority:0, lat:51.0940, lng:1.1430, mapsUrl:"https://maps.google.com/?q=LeShuttle+Folkestone+Terminal", reason:"Back in the UK.", icon:"🇬🇧" },
        { id:"d7s9", order:9, time:"18:00", tz:"UK", location:"North Cadbury — Home", type:"hotel", priority:0, lat:51.0333, lng:-2.5333, mapsUrl:"https://maps.google.com/?q=North+Cadbury+Somerset", reason:"Arrive home.", icon:"🏠" }
      ]
    }
  ]
};
