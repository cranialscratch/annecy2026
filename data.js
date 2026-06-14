// v1 itinerary preserved below (commented out) — restore if needed
// const TRIP_DATA_V1 = { ... }; // see git history

const TRIP_DATA = {
  title: "Annecy 2026",
  days: [
    {
      id: "countdown",
      date: "2026-01-01",
      dateEnd: "2026-06-16",
      isCountdown: true,
      label: "Countdown",
      title: "Holiday Countdown",
      subtitle: "Time until departure",
      stops: []
    },
    /* ── Test Day A — Sun 14 Jun — leave-by / edit / ripple testing ── */
    {
      id: "testA",
      date: "2026-06-14",
      label: "Test",
      title: "Test Day A",
      subtitle: "Leave-by · Edit · Ripple testing",
      stops: [
        { id:"tAs1", order:1, time:"08:00", tz:"UK", location:"Home — Test Start", type:"depart", priority:0, lat:51.0333, lng:-2.5333, mapsUrl:"https://maps.google.com/?q=North+Cadbury+Somerset", reason:"Kick off. Edit this time and use Ripple to shift everything below." },
        { id:"tAs2", order:2, time:"09:00", tz:"UK", location:"Coffee Stop", type:"food", priority:2, lat:51.0333, lng:-2.5000, mapsUrl:"https://maps.google.com/?q=coffee+shop+Somerset", reason:"Test leave-by: 45-minute window. If your clock is between 09:00–09:45 you will see the live countdown.", duration:45, veganFriendly:true },
        { id:"tAs3", order:3, time:"10:00", tz:"UK", location:"Town Centre Wander", type:"wander", priority:2, lat:51.0500, lng:-2.5000, mapsUrl:"https://maps.google.com/?q=Somerton+Somerset", reason:"Test leave-by: 90-minute window. Between 10:00–11:30 you see Leave in Xm.", duration:90 },
        { id:"tAs4", order:4, time:"12:00", tz:"UK", location:"Lunch", type:"food", priority:2, lat:51.0600, lng:-2.5200, mapsUrl:"https://maps.google.com/?q=restaurant+Somerset", reason:"Test leave-by: 60-minute window. Between 12:00–13:00 you see Leave in Xm.", duration:60, veganFriendly:true },
        { id:"tAs5", order:5, time:"14:00", tz:"UK", location:"Nature Reserve", type:"experience", priority:3, lat:51.0700, lng:-2.5400, mapsUrl:"https://maps.google.com/?q=Glastonbury+Tor", reason:"Test leave-by: 2-hour window. Between 14:00–16:00 you see Leave in Xm.", duration:120 },
        { id:"tAs6", order:6, time:"16:30", tz:"UK", location:"Tesla Supercharger Shepton Mallet", type:"charging", priority:0, lat:51.1936, lng:-2.5475, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Shepton+Mallet", reason:"Charge stop with no duration set — no leave-by pill should appear here." },
        { id:"tAs7", order:7, time:"17:30", tz:"UK", location:"Viewpoint Hill", type:"scenic", priority:3, lat:51.0800, lng:-2.5600, mapsUrl:"https://maps.google.com/?q=Cheddar+Gorge", reason:"Test leave-by: 30-minute window. Between 17:30–18:00.", duration:30 },
        { id:"tAs8", order:8, time:"19:00", tz:"UK", location:"Dinner", type:"food", priority:2, lat:51.0333, lng:-2.5333, mapsUrl:"https://maps.google.com/?q=vegan+restaurant+Somerset", reason:"Test leave-by: 90-minute window. Between 19:00–20:30.", duration:90, veganFriendly:true },
        { id:"tAs9", order:9, time:"21:00", tz:"UK", location:"Home — Test End", type:"hotel", priority:0, lat:51.0333, lng:-2.5333, mapsUrl:"https://maps.google.com/?q=North+Cadbury+Somerset", reason:"End of Test Day A." }
      ]
    },
    /* ── Test Day B — Mon 15 Jun — leave-by / edit / ripple testing ── */
    {
      id: "testB",
      date: "2026-06-15",
      label: "Test",
      title: "Test Day B",
      subtitle: "Leave-by · Edit · Ripple testing",
      stops: [
        { id:"tBs1", order:1, time:"07:30", tz:"UK", location:"Home — Test Start", type:"depart", priority:0, lat:51.0333, lng:-2.5333, mapsUrl:"https://maps.google.com/?q=North+Cadbury+Somerset", reason:"Edit this time then use Ripple — all following stops should shift by the same amount." },
        { id:"tBs2", order:2, time:"08:30", tz:"UK", location:"Breakfast Café", type:"food", priority:2, lat:51.0400, lng:-2.5200, mapsUrl:"https://maps.google.com/?q=cafe+Somerset", reason:"Leave-by test: 45-minute window. Between 08:30–09:15.", duration:45, veganFriendly:true },
        { id:"tBs3", order:3, time:"10:00", tz:"UK", location:"Historic House", type:"architecture", priority:3, lat:51.0550, lng:-2.5100, mapsUrl:"https://maps.google.com/?q=Montacute+House+Somerset", reason:"Leave-by test: 2-hour window. Between 10:00–12:00.", duration:120 },
        { id:"tBs4", order:4, time:"12:30", tz:"UK", location:"Village Wander", type:"village", priority:2, lat:51.0650, lng:-2.5050, mapsUrl:"https://maps.google.com/?q=Montacute+village+Somerset", reason:"Leave-by test: 60-minute window. Between 12:30–13:30.", duration:60 },
        { id:"tBs5", order:5, time:"14:00", tz:"UK", location:"Lunch Stop", type:"food", priority:2, lat:51.0700, lng:-2.5000, mapsUrl:"https://maps.google.com/?q=vegan+food+Somerset", reason:"Leave-by test: urgent zone — only 15 minutes. Opens urgent mode immediately.", duration:15, veganFriendly:true },
        { id:"tBs6", order:6, time:"15:00", tz:"UK", location:"Supercharger Test", type:"charging", priority:0, lat:51.0800, lng:-2.5100, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger", reason:"No duration set on this charging stop — no leave-by pill." },
        { id:"tBs7", order:7, time:"16:30", tz:"UK", location:"Gorge Walk", type:"experience", priority:3, lat:51.2737, lng:-2.7577, mapsUrl:"https://maps.google.com/?q=Cheddar+Gorge", reason:"Leave-by test: 90-minute window. Between 16:30–18:00.", duration:90 },
        { id:"tBs8", order:8, time:"18:30", tz:"UK", location:"Sunset Point", type:"scenic", priority:3, lat:51.0900, lng:-2.5500, mapsUrl:"https://maps.google.com/?q=Glastonbury+Tor", reason:"Leave-by test: 30 minutes exactly. Between 18:30–19:00.", duration:30 },
        { id:"tBs9", order:9, time:"19:30", tz:"UK", location:"Dinner", type:"food", priority:2, lat:51.0333, lng:-2.5333, mapsUrl:"https://maps.google.com/?q=vegan+restaurant+Somerset", reason:"Leave-by test: 90-minute window. Between 19:30–21:00.", duration:90, veganFriendly:true },
        { id:"tBs10", order:10, time:"21:30", tz:"UK", location:"Home — Test End", type:"hotel", priority:0, lat:51.0333, lng:-2.5333, mapsUrl:"https://maps.google.com/?q=North+Cadbury+Somerset", reason:"End of Test Day B." }
      ]
    },
    /* ── Day 1 — Wed 17 Jun — North Cadbury to Amiens ─────────────── */
    {
      id: "day1",
      date: "2026-06-17",
      label: "Day 1",
      title: "Home to Amiens",
      subtitle: "Cross-Channel via LeShuttle",
      stops: [
        { id:"d1s1", order:1, time:"10:30", tz:"UK", location:"North Cadbury, Somerset", type:"depart", priority:0, lat:51.0333, lng:-2.5333, mapsUrl:"https://maps.google.com/?q=North+Cadbury+Somerset", reason:"Leave home." },
        { id:"d1s2", order:2, time:"13:15", tz:"UK", location:"Tesla Supercharger Folkestone", type:"charging", priority:0, lat:51.0882, lng:1.1728, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Folkestone", reason:"Charge to 90–95%. Coffee, toilets and a rest. Allow extra time — first-time biometric checks at the terminal can cause delays.", duration:60 },
        { id:"d1s3", order:3, time:"14:15", tz:"UK", location:"LeShuttle Check-In, Folkestone", type:"transport", priority:0, lat:51.0940, lng:1.1430, mapsUrl:"https://maps.google.com/?q=LeShuttle+Folkestone+Terminal", reason:"Arrive at the terminal 90 minutes before departure. Biometric document checks required for first-time travellers." },
        { id:"d1s4", order:4, time:"15:46", tz:"UK", location:"LeShuttle Departure", type:"transport", priority:0, lat:51.0940, lng:1.1430, mapsUrl:"https://maps.google.com/?q=LeShuttle+Folkestone+Terminal", reason:"Channel Tunnel crossing — approximately 35 minutes." },
        { id:"d1s5", order:5, time:"17:21", tz:"FR", location:"LeShuttle Arrival, Calais", type:"transport", priority:0, lat:50.9513, lng:1.8587, mapsUrl:"https://maps.google.com/?q=LeShuttle+Calais+Terminal", reason:"Arrive in France. Welcome to the continent!" },
        { id:"d1s6", order:6, time:"18:30", tz:"FR", location:"Saint-Valery-sur-Somme", type:"town", priority:3, lat:50.1833, lng:1.6333, mapsUrl:"https://maps.google.com/?q=Saint-Valery-sur-Somme", reason:"First proper French stop. Stroll the old harbour with its fishing boats and sunset light, then wind up through the medieval ramparts and old town streets — one of the most atmospheric evenings of the trip.", duration:90 },
        { id:"d1s7", order:7, time:"20:00", tz:"FR", location:"Depart Saint-Valery", type:"depart", priority:0, lat:50.1833, lng:1.6333, mapsUrl:"https://maps.google.com/?q=Saint-Valery-sur-Somme", reason:"Continue to Amiens." },
        { id:"d1s8", order:8, time:"20:30", tz:"FR", location:"Tesla Supercharger Dury (Amiens)", type:"charging", priority:0, lat:49.8390, lng:2.2870, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Dury+Amiens", reason:"Top up while grabbing snacks if needed." },
        { id:"d1s9", order:9, time:"20:50", tz:"FR", location:"Moxy Amiens", type:"hotel", priority:0, lat:49.8941, lng:2.2958, mapsUrl:"https://maps.google.com/?q=Moxy+Amiens", reason:"Check in and drop bags." },
        { id:"d1s10", order:10, time:"21:05", tz:"FR", location:"Amiens Cathedral", type:"architecture", priority:3, lat:49.8942, lng:2.3019, mapsUrl:"https://maps.google.com/?q=Cathedrale+Notre-Dame+d+Amiens", reason:"Stunning evening views of the largest Gothic cathedral in France, just a short walk from the hotel." },
        { id:"d1s11", order:11, time:"21:30", tz:"FR", location:"Dinner, Central Amiens", type:"food", priority:2, lat:49.8942, lng:2.3020, mapsUrl:"https://maps.google.com/?q=vegan+restaurant+Amiens", reason:"Find dinner in the cathedral quarter.", veganFriendly:true },
        { id:"d1s12", order:12, time:"22:30", tz:"FR", location:"Moxy Amiens", type:"hotel", priority:0, lat:49.8941, lng:2.2958, mapsUrl:"https://maps.google.com/?q=Moxy+Amiens", reason:"Overnight stay." }
      ]
    },
    /* ── Day 2 — Thu 18 Jun — Amiens to Troyes ────────────────────── */
    {
      id: "day2",
      date: "2026-06-18",
      label: "Day 2",
      title: "Amiens to Troyes",
      subtitle: "Floating gardens, roses & timber frames",
      stops: [
        { id:"d2s1", order:1, time:"08:00", tz:"FR", location:"Moxy Amiens", type:"depart", priority:0, lat:49.8941, lng:2.2958, mapsUrl:"https://maps.google.com/?q=Moxy+Amiens", reason:"Breakfast and checkout." },
        { id:"d2s2", order:2, time:"08:20", tz:"FR", location:"Hortillonnages d'Amiens", type:"experience", priority:3, lat:49.8978, lng:2.3138, mapsUrl:"https://maps.google.com/?q=Hortillonnages+Amiens", reason:"One of the most unique landscapes in France — a labyrinth of canals, floating gardens and wildlife. Take the guided boat tour through the islands then walk the towpaths.", duration:120 },
        { id:"d2s3", order:3, time:"10:30", tz:"FR", location:"Le Colibri, Amiens", type:"food", priority:2, lat:49.8952, lng:2.2978, mapsUrl:"https://maps.google.com/?q=Le+Colibri+restaurant+Amiens", reason:"Excellent plant-based café in central Amiens, popular for brunch and coffee before heading south.", veganFriendly:true },
        { id:"d2s4", order:4, time:"11:00", tz:"FR", location:"Depart Amiens", type:"depart", priority:0, lat:49.8942, lng:2.3020, mapsUrl:"https://maps.google.com/?q=Amiens", reason:"Head towards Gerberoy." },
        { id:"d2s5", order:5, time:"12:15", tz:"FR", location:"Gerberoy", type:"village", priority:3, lat:49.4853, lng:1.8239, mapsUrl:"https://maps.google.com/?q=Gerberoy+France", reason:"One of France's most beautiful villages — medieval lanes draped in climbing roses, artisan shops and a timeless atmosphere. Explore on foot and find lunch.", duration:90, veganFriendly:true },
        { id:"d2s6", order:6, time:"13:45", tz:"FR", location:"Depart Gerberoy", type:"depart", priority:0, lat:49.4853, lng:1.8239, mapsUrl:"https://maps.google.com/?q=Gerberoy+France", reason:"Continue towards Troyes." },
        { id:"d2s7", order:7, time:"15:45", tz:"FR", location:"Tesla Supercharger Troyes", type:"charging", priority:0, lat:48.3135, lng:4.1020, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Pont-Sainte-Marie+France", reason:"Charge, coffee and comfort break before the evening." },
        { id:"d2s8", order:8, time:"16:30", tz:"FR", location:"Troyes Old Town", type:"architecture", priority:3, lat:48.2973, lng:4.0744, mapsUrl:"https://maps.google.com/?q=Troyes+France", reason:"One of the finest collections of half-timbered buildings in France — compact, walkable and full of atmosphere." },
        { id:"d2s9", order:9, time:"16:45", tz:"FR", location:"Ruelle des Chats, Troyes", type:"architecture", priority:3, lat:48.2968, lng:4.0735, mapsUrl:"https://maps.google.com/?q=Ruelle+des+Chats+Troyes", reason:"Famous medieval lane where the leaning timber-framed buildings almost touch overhead." },
        { id:"d2s10", order:10, time:"17:15", tz:"FR", location:"Cathedral Area, Troyes", type:"architecture", priority:2, lat:48.2995, lng:4.0781, mapsUrl:"https://maps.google.com/?q=Cathedrale+Saint-Pierre-et-Saint-Paul+de+Troyes", reason:"Beautiful Gothic architecture with some of the finest medieval stained glass in Europe." },
        { id:"d2s11", order:11, time:"17:45", tz:"FR", location:"Café La Fiancée, Troyes", type:"food", priority:2, lat:48.2975, lng:4.0745, mapsUrl:"https://maps.google.com/?q=Cafe+La+Fiancee+Troyes", reason:"Speciality coffee and vegan-friendly options in the old town.", veganFriendly:true },
        { id:"d2s12", order:12, time:"18:30", tz:"FR", location:"Evening Wander, Troyes", type:"wander", priority:3, lat:48.2973, lng:4.0744, mapsUrl:"https://maps.google.com/?q=Centre+Historique+de+Troyes", reason:"Enjoy the old town as it quietens down for the evening.", duration:60 },
        { id:"d2s13", order:13, time:"19:30", tz:"FR", location:"Dinner, Troyes", type:"food", priority:2, lat:48.2973, lng:4.0744, mapsUrl:"https://maps.google.com/?q=vegan+restaurant+Troyes+France", reason:"Relaxed evening meal in the old town.", veganFriendly:true },
        { id:"d2s14", order:14, time:"21:00", tz:"FR", location:"B&B HOTEL Troyes Centre", type:"hotel", priority:0, lat:48.2990, lng:4.0760, mapsUrl:"https://maps.google.com/?q=B%26B+HOTEL+Troyes+Centre", reason:"Overnight stay." }
      ]
    },
    /* ── Day 3 — Fri 19 Jun — Troyes to Beaune ────────────────────── */
    {
      id: "day3",
      date: "2026-06-19",
      label: "Day 3",
      title: "Troyes to Beaune",
      subtitle: "Burgundy villages & the wine route",
      stops: [
        { id:"d3s1", order:1, time:"08:00", tz:"FR", location:"B&B HOTEL Troyes Centre", type:"depart", priority:0, lat:48.2990, lng:4.0760, mapsUrl:"https://maps.google.com/?q=B%26B+HOTEL+Troyes+Centre", reason:"Breakfast and checkout." },
        { id:"d3s2", order:2, time:"08:45", tz:"FR", location:"Flavigny-sur-Ozerain", type:"village", priority:3, lat:47.5167, lng:4.5333, mapsUrl:"https://maps.google.com/?q=Flavigny-sur-Ozerain", reason:"One of the prettiest villages in France. Wander the medieval lanes, visit the famous anise sweet workshop in the old abbey, and take in the viewpoints over the valley.", duration:90 },
        { id:"d3s3", order:3, time:"10:30", tz:"FR", location:"Abbey of Fontenay", type:"architecture", priority:3, lat:47.6378, lng:4.3992, mapsUrl:"https://maps.google.com/?q=Abbaye+de+Fontenay", reason:"UNESCO World Heritage Cistercian abbey — beautiful Romanesque buildings, a working forge and landscaped grounds set in a wooded valley. Allow time to explore all the buildings.", duration:90 },
        { id:"d3s4", order:4, time:"12:30", tz:"FR", location:"Semur-en-Auxois", type:"town", priority:3, lat:47.4833, lng:4.3333, mapsUrl:"https://maps.google.com/?q=Semur-en-Auxois", reason:"One of Burgundy's most photogenic medieval towns — dramatically set on a granite spur above the river Armançon. Cross the old bridges, walk the ramparts and towers, then have lunch.", duration:90, veganFriendly:true },
        { id:"d3s5", order:5, time:"15:00", tz:"FR", location:"Clos de Vougeot", type:"historic", priority:3, lat:47.1667, lng:4.9500, mapsUrl:"https://maps.google.com/?q=Clos+de+Vougeot", reason:"Historic 12th-century Cistercian château surrounded by the world's most celebrated Grand Cru vineyards." },
        { id:"d3s6", order:6, time:"15:30", tz:"FR", location:"Route des Grands Crus", type:"scenic", priority:3, lat:47.2000, lng:4.9500, mapsUrl:"https://maps.google.com/?q=Route+des+Grands+Crus+Bourgogne", reason:"One of France's greatest drives — the UNESCO Burgundy wine route through Nuits-Saint-Georges, Gevrey-Chambertin and the great vineyard villages." },
        { id:"d3s7", order:7, time:"16:00", tz:"FR", location:"Vosne-Romanée", type:"village", priority:2, lat:47.1667, lng:4.9667, mapsUrl:"https://maps.google.com/?q=Vosne-Romanee+France", reason:"Elegant village surrounded by the world's most expensive vineyards including Romanée-Conti." },
        { id:"d3s8", order:8, time:"16:45", tz:"FR", location:"Saint-Romain", type:"village", priority:3, lat:46.9833, lng:4.7833, mapsUrl:"https://maps.google.com/?q=Saint-Romain+Bourgogne", reason:"Hidden village beneath dramatic limestone cliffs with wonderful panoramic views across the Burgundy valley." },
        { id:"d3s9", order:9, time:"17:30", tz:"FR", location:"Tesla Supercharger Beaune", type:"charging", priority:0, lat:47.0167, lng:4.8400, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Beaune", reason:"Top up before the evening in Beaune." },
        { id:"d3s10", order:10, time:"18:00", tz:"FR", location:"Beaune Old Town", type:"architecture", priority:3, lat:47.0200, lng:4.8380, mapsUrl:"https://maps.google.com/?q=Hospices+de+Beaune", reason:"Historic centre anchored by the extraordinary Hôtel-Dieu de Beaune — one of France's finest medieval buildings with a polychrome tile roof. Beautiful evening atmosphere.", duration:60 },
        { id:"d3s11", order:11, time:"19:00", tz:"FR", location:"Dinner, Beaune", type:"food", priority:2, lat:47.0200, lng:4.8380, mapsUrl:"https://maps.google.com/?q=vegan+restaurant+Beaune+France", reason:"Final relaxed evening before arriving in Annecy tomorrow.", veganFriendly:true },
        { id:"d3s12", order:12, time:"21:00", tz:"FR", location:"ibis Styles Beaune Centre", type:"hotel", priority:0, lat:47.0230, lng:4.8370, mapsUrl:"https://maps.google.com/?q=ibis+Styles+Beaune+Centre", reason:"Overnight stay." }
      ]
    },
    /* ── Day 4 — Sat 20 Jun — Beaune to Annecy, family arrives ─────── */
    {
      id: "day4",
      date: "2026-06-20",
      label: "Day 4",
      title: "Beaune to Annecy",
      subtitle: "Into the Alps — family arrives tonight",
      stops: [
        { id:"d4s1", order:1, time:"08:00", tz:"FR", location:"ibis Styles Beaune Centre", type:"depart", priority:0, lat:47.0230, lng:4.8370, mapsUrl:"https://maps.google.com/?q=ibis+Styles+Beaune+Centre", reason:"Breakfast and checkout. Today is the big day — Annecy!" },
        { id:"d4s2", order:2, time:"11:00", tz:"FR", location:"Tesla Supercharger Annecy-Seynod", type:"charging", priority:0, lat:45.8833, lng:6.1000, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Annecy+Seynod", reason:"Charge to 90–95% for the festival week and the Geneva Airport run this evening.", duration:45 },
        { id:"d4s3", order:3, time:"12:00", tz:"FR", location:"Carrefour Annecy-Seynod", type:"food", priority:2, lat:45.8914, lng:6.0986, mapsUrl:"https://maps.google.com/?q=Carrefour+Annecy+Seynod", reason:"Big grocery shop for the chalet — stock up for the week. Produce, breakfast things, snacks and everything you need so you're not shopping again until you leave.", duration:60 },
        { id:"d4s4", order:4, time:"16:00", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"hotel", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l+Arete+74290+Menthon-Saint-Bernard", reason:"Check in from 16:00. Unpack, settle in and enjoy the first view over Lake Annecy before heading to the airport." },
        { id:"d4s5", order:5, time:"19:15", tz:"FR", location:"Depart for Geneva Airport", type:"depart", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=Geneva+Airport", reason:"Allow 45 minutes to reach the French-side arrivals." },
        { id:"d4s6", order:6, time:"20:00", tz:"FR", location:"Geneva Airport — French Side", type:"transport", priority:0, lat:46.2380, lng:6.1090, mapsUrl:"https://maps.app.goo.gl/dk7AWyRJgz6aAfdp7", reason:"Family lands at 20:20 French time. Meet at arrivals — French side terminal (no customs formalities needed)." }
      ]
    },
    /* ── Festival Week — Sat 20 Jun to Sat 27 Jun ───────────────────── */
    {
      id: "festival",
      date: "2026-06-20",
      dateEnd: "2026-06-27",
      label: "Festival",
      title: "Annecy Festival Week",
      subtitle: "International Animation Film Festival 2026",
      isFestival: true,
      stops: [
        { id:"fs1", order:1, time:"All week", tz:"FR", location:"Annecy Town Centre", type:"festival", priority:3, lat:45.8992, lng:6.1294, mapsUrl:"https://maps.google.com/?q=Annecy+France", reason:"International Animation Film Festival 2026 — screenings, exhibitions and events throughout the town. Main venues: Bonlieu Theatre, the Pâquier park and the Imperial Palace on the lake." },
        { id:"fs2", order:2, time:"Daily", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"hotel", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l+Arete+74290+Menthon-Saint-Bernard", reason:"Your base for the week with spectacular views over Lake Annecy from the terrace." },
        { id:"fs3", order:3, time:"Daily", tz:"FR", location:"Lake Annecy", type:"experience", priority:3, lat:45.8667, lng:6.1833, mapsUrl:"https://maps.google.com/?q=Lac+Annecy", reason:"Swimming, cycling and boat trips on one of Europe's clearest lakes. Hire bikes in Annecy and follow the lakeside path all the way to Talloires — flat and stunning." },
        { id:"fs4", order:4, time:"Daily", tz:"FR", location:"Annecy Old Town", type:"wander", priority:3, lat:45.8992, lng:6.1294, mapsUrl:"https://maps.google.com/?q=Vieille+Ville+Annecy", reason:"Canal-laced old town with colourful flower-lined buildings, the 12th-century Palais de l'Isle and lively café terraces." },
        { id:"fs5", order:5, time:"Daily", tz:"FR", location:"Château d'Annecy", type:"architecture", priority:2, lat:45.9004, lng:6.1279, mapsUrl:"https://maps.google.com/?q=Chateau+d+Annecy", reason:"Hilltop castle with panoramic views over the lake and old town. Houses the Musée d'Annecy — regional art, natural history and Alpine life." },
        { id:"fs6", order:6, time:"Nearby", tz:"FR", location:"Château de Menthon-Saint-Bernard", type:"architecture", priority:3, lat:45.8566, lng:6.2037, mapsUrl:"https://maps.google.com/?q=Chateau+de+Menthon-Saint-Bernard", reason:"Fairytale château right next to your chalet, said to have inspired Sleeping Beauty. Open for guided tours — extraordinary lake views from the ramparts." },
        { id:"fs7", order:7, time:"Nearby", tz:"FR", location:"Talloires", type:"village", priority:3, lat:45.8311, lng:6.2178, mapsUrl:"https://maps.google.com/?q=Talloires+France", reason:"Stunning village on the lake's east shore with a 17th-century abbey, café terraces and tranquil abbey gardens. 20 minutes from the chalet by road or bike." },
        { id:"fs8", order:8, time:"Nearby", tz:"FR", location:"Gorges du Fier", type:"experience", priority:2, lat:45.9167, lng:6.0333, mapsUrl:"https://maps.google.com/?q=Gorges+du+Fier+Lovagny", reason:"Spectacular narrow gorge with suspended walkways over rushing glacial water — dramatic and unique. 20 minutes west of Annecy." },
        { id:"fs9", order:9, time:"Nearby", tz:"FR", location:"Château de Thorens", type:"architecture", priority:2, lat:45.9833, lng:6.2000, mapsUrl:"https://maps.google.com/?q=Chateau+de+Thorens+France", reason:"Medieval castle in the hills north of Annecy associated with Saint Francis de Sales. Far less visited than the town castle and very atmospheric." },
        { id:"fs10", order:10, time:"Daily", tz:"FR", location:"Pont des Amours & Jardins de l'Europe", type:"wander", priority:2, lat:45.9011, lng:6.1278, mapsUrl:"https://maps.google.com/?q=Pont+des+Amours+Annecy", reason:"The romantic canal bridge and lakeside gardens with weeping willows, swans and mountain views — perfect for a morning stroll or evening walk." },
        { id:"fs11", order:11, time:"Daily", tz:"FR", location:"Le Green Café, Annecy", type:"food", priority:3, lat:45.8990, lng:6.1290, mapsUrl:"https://maps.google.com/?q=Le+Green+Cafe+Annecy", reason:"One of Annecy's best vegan-friendly spots, close to the Bonlieu festival venue. Salads, wraps and fresh juices — great for a quick festival lunch.", veganFriendly:true },
        { id:"fs12", order:12, time:"Daily", tz:"FR", location:"L'Aromatic, Annecy", type:"food", priority:2, lat:45.8998, lng:6.1280, mapsUrl:"https://maps.google.com/?q=L+Aromatic+Annecy", reason:"Popular vegan-friendly restaurant near the old town — fresh seasonal dishes, good wine list and a relaxed atmosphere away from the festival crowds.", veganFriendly:true },
        { id:"fs13", order:13, time:"Daily", tz:"FR", location:"Brasserie des Européens, Annecy", type:"food", priority:2, lat:45.8994, lng:6.1300, mapsUrl:"https://maps.google.com/?q=Brasserie+des+Europeens+Annecy", reason:"Relaxed brasserie near the Bonlieu with terrace dining and plant-based options — a reliable choice for festival lunches and casual dinners.", veganFriendly:true },
        { id:"fs14", order:14, time:"Daily", tz:"FR", location:"Palais de l'Isle, Annecy", type:"architecture", priority:3, lat:45.8995, lng:6.1287, mapsUrl:"https://maps.google.com/?q=Palais+de+l+Isle+Annecy", reason:"The most photographed building in Annecy — 12th-century island prison on the Thiou canal. Now a local history museum and one of the most iconic sights in France." },
        { id:"fs15", order:15, time:"Daily", tz:"FR", location:"HappyCow Vegan Map, Annecy", type:"food", priority:2, lat:45.8992, lng:6.1294, mapsUrl:"https://www.happycow.net/europe/france/annecy/", reason:"Browse all vegan and vegan-friendly restaurants near your current location in Annecy.", veganFriendly:true }
      ]
    },
    /* ── Return Day 1 — Sat 27 Jun — Annecy to Besançon ─────────────── */
    {
      id: "day5",
      date: "2026-06-27",
      label: "Day 5",
      title: "Annecy to Besançon",
      subtitle: "UNESCO salt works & riverside city",
      stops: [
        { id:"d5s1", order:1, time:"09:00", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"depart", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l+Arete+74290+Menthon-Saint-Bernard", reason:"Leave after breakfast. Begin the return journey north." },
        { id:"d5s2", order:2, time:"11:30", tz:"FR", location:"Saline Royale d'Arc-et-Senans", type:"architecture", priority:3, lat:47.0333, lng:5.7833, mapsUrl:"https://maps.google.com/?q=Saline+Royale+d+Arc-et-Senans", reason:"Extraordinary UNESCO World Heritage industrial architecture — Claude-Nicolas Ledoux's visionary 18th-century royal saltworks. The semicircular complex of buildings, formal gardens and exhibition spaces is unlike anything else on the trip.", duration:120 },
        { id:"d5s3", order:3, time:"13:30", tz:"FR", location:"Lunch, Arc-et-Senans", type:"food", priority:2, lat:47.0333, lng:5.7833, mapsUrl:"https://maps.google.com/?q=restaurant+Arc-et-Senans", reason:"Relaxed lunch stop before Besançon.", veganFriendly:true },
        { id:"d5s4", order:4, time:"15:00", tz:"FR", location:"Tesla Supercharger Besançon", type:"charging", priority:0, lat:47.2378, lng:6.0241, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Besancon", reason:"Top up before hotel and evening exploring." },
        { id:"d5s5", order:5, time:"15:30", tz:"FR", location:"Besançon Old Town", type:"architecture", priority:3, lat:47.2378, lng:6.0241, mapsUrl:"https://maps.google.com/?q=Besancon+France", reason:"Beautiful UNESCO-listed city almost entirely enclosed in a loop of the River Doubs. Full of fine architecture, walkable streets and a surprisingly lively café scene." },
        { id:"d5s6", order:6, time:"17:00", tz:"FR", location:"Citadel of Besançon", type:"experience", priority:3, lat:47.2358, lng:6.0320, mapsUrl:"https://maps.google.com/?q=Citadelle+de+Besancon", reason:"Vauban's hilltop fortress with superb views across the city and the river loop below. UNESCO World Heritage Site housing several museums and a zoo." },
        { id:"d5s7", order:7, time:"19:00", tz:"FR", location:"Dinner, Besançon", type:"food", priority:2, lat:47.2378, lng:6.0241, mapsUrl:"https://maps.google.com/?q=vegan+restaurant+Besancon+France", reason:"Enjoy the old town atmosphere for the evening.", veganFriendly:true },
        { id:"d5s8", order:8, time:"21:00", tz:"FR", location:"B&B HOTEL Besançon Valentin", type:"hotel", priority:0, lat:47.2500, lng:6.0100, mapsUrl:"https://maps.app.goo.gl/kmEHshZWYuZJRMnx9", reason:"Overnight stay." }
      ]
    },
    /* ── Return Day 2 — Sun 28 Jun — Besançon to Rouen ─────────────── */
    {
      id: "day6",
      date: "2026-06-28",
      label: "Day 6",
      title: "Besançon to Rouen",
      subtitle: "Monet's Giverny & Gothic Rouen",
      stops: [
        { id:"d6s1", order:1, time:"08:30", tz:"FR", location:"B&B HOTEL Besançon Valentin", type:"depart", priority:0, lat:47.2500, lng:6.0100, mapsUrl:"https://maps.google.com/?q=Besancon+France", reason:"Breakfast and checkout. Long drive day — Rouen via Giverny." },
        { id:"d6s2", order:2, time:"11:00", tz:"FR", location:"Tesla Supercharger Chartres", type:"charging", priority:0, lat:48.4350, lng:1.5200, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Chartres", reason:"Natural charging stop on the route north. Coffee and facilities while the car charges." },
        { id:"d6s3", order:3, time:"13:00", tz:"FR", location:"Giverny", type:"experience", priority:3, lat:49.0754, lng:1.5339, mapsUrl:"https://maps.google.com/?q=Giverny+France", reason:"Monet's village — one of France's most beautiful destinations. Visit the famous water lily garden and Japanese bridge, the house with its vivid interior, and wander the lanes of this tiny Norman village.", duration:150 },
        { id:"d6s4", order:4, time:"17:00", tz:"FR", location:"Rouen Old Town", type:"architecture", priority:3, lat:49.4431, lng:1.0993, mapsUrl:"https://maps.google.com/?q=Rouen+France", reason:"One of France's finest historic centres — cobbled streets lined with half-timbered houses and overlooked by Gothic spires." },
        { id:"d6s5", order:5, time:"17:30", tz:"FR", location:"Rouen Cathedral", type:"architecture", priority:3, lat:49.4400, lng:1.0950, mapsUrl:"https://maps.google.com/?q=Cathedrale+Notre-Dame+de+Rouen", reason:"Extraordinary Gothic cathedral famously painted in different light conditions by Monet. The façade changes colour dramatically through the day." },
        { id:"d6s6", order:6, time:"19:00", tz:"FR", location:"Dinner, Rouen", type:"food", priority:2, lat:49.4431, lng:1.0993, mapsUrl:"https://maps.google.com/?q=vegan+restaurant+Rouen+France", reason:"Final French evening meal — last night on the continent.", veganFriendly:true },
        { id:"d6s7", order:7, time:"21:00", tz:"FR", location:"B&B HOTEL Rouen Centre Rive Droite", type:"hotel", priority:0, lat:49.4431, lng:1.0993, mapsUrl:"https://maps.app.goo.gl/PP7oKfUNM2C1a12T9", reason:"Overnight stay." }
      ]
    },
    /* ── Return Day 3 — Mon 29 Jun — Rouen to Home ──────────────────── */
    {
      id: "day7",
      date: "2026-06-29",
      label: "Day 7",
      title: "Rouen to Home",
      subtitle: "LeShuttle · North Cadbury",
      stops: [
        { id:"d7s1", order:1, time:"08:30", tz:"FR", location:"B&B HOTEL Rouen Centre", type:"depart", priority:0, lat:49.4431, lng:1.0993, mapsUrl:"https://maps.google.com/?q=B%26B+HOTEL+Rouen+Centre", reason:"Breakfast and checkout. Final morning in France." },
        { id:"d7s2", order:2, time:"11:00", tz:"FR", location:"Tesla Supercharger Coquelles", type:"charging", priority:0, lat:50.9283, lng:1.8167, mapsUrl:"https://maps.google.com/?q=Tesla+Supercharger+Coquelles", reason:"Final charge before crossing. Top up to 90% for the run home from Folkestone." },
        { id:"d7s3", order:3, time:"12:30", tz:"FR", location:"LeShuttle Check-In, Calais", type:"transport", priority:0, lat:50.9513, lng:1.8587, mapsUrl:"https://maps.google.com/?q=LeShuttle+Calais+Terminal", reason:"Arrive one hour before departure." },
        { id:"d7s4", order:4, time:"13:36", tz:"FR", location:"LeShuttle Departure", type:"transport", priority:0, lat:50.9513, lng:1.8587, mapsUrl:"https://maps.google.com/?q=LeShuttle+Calais+Terminal", reason:"Return crossing — approximately 35 minutes through the tunnel." },
        { id:"d7s5", order:5, time:"13:11", tz:"UK", location:"Folkestone Arrival", type:"transport", priority:0, lat:51.0940, lng:1.1430, mapsUrl:"https://maps.google.com/?q=LeShuttle+Folkestone+Terminal", reason:"Back in the UK. Nearly home." },
        { id:"d7s6", order:6, time:"16:30", tz:"UK", location:"North Cadbury — Home", type:"hotel", priority:0, lat:51.0333, lng:-2.5333, mapsUrl:"https://maps.google.com/?q=North+Cadbury+Somerset", reason:"Home. Holiday complete." }
      ]
    }
  ]
};
