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
    /* ── Day 1 — Wed 17 Jun — North Cadbury to Amiens ─────────────── */
    {
      id: "day1",
      date: "2026-06-17",
      label: "Day 1",
      title: "Home to Amiens",
      subtitle: "Cross-Channel via LeShuttle",
      stops: [
        { id:"d1s1", order:1, time:"10:30", tz:"UK", location:"North Cadbury, Somerset", type:"depart", priority:0, lat:51.0333, lng:-2.5333, mapsUrl:"https://maps.google.com/?q=North+Cadbury+Somerset", reason:"Leave home." },
        { id:"d1s2", order:2, time:"13:30", tz:"UK", location:"Tesla Supercharger Folkestone", type:"charging", priority:0, lat:51.0940, lng:1.1430, mapsUrl:"https://maps.google.com/?q=Eurotunnel+UK+terminal+Ashford+Road+CT18+8XX+Folkestone+United+Kingdom", reason:"Exact Tesla location. Open 24/7; charge before the booked LeShuttle crossing.", duration:45 },
        { id:"d1s3", order:3, time:"14:15", tz:"UK", location:"LeShuttle Check-In, Folkestone", type:"transport", priority:0, lat:51.0940, lng:1.1430, mapsUrl:"https://maps.google.com/?q=LeShuttle+Folkestone+Terminal", reason:"Arrive around 90 minutes before departure. Biometric document checks required for first-time travellers." },
        { id:"d1s4", order:4, time:"15:46", tz:"UK", location:"LeShuttle Departure", type:"transport", priority:0, lat:51.0940, lng:1.1430, mapsUrl:"https://maps.google.com/?q=LeShuttle+Folkestone+Terminal", reason:"Booked outbound crossing. Channel Tunnel crossing — approximately 35 minutes.", fixed:true },
        { id:"d1s5", order:5, time:"17:21", tz:"FR", location:"LeShuttle Arrival, Calais", type:"transport", priority:0, lat:50.9513, lng:1.8587, mapsUrl:"https://maps.google.com/?q=LeShuttle+Calais+Terminal", reason:"Arrive in France. Welcome to the continent!" },
        { id:"d1s6", order:6, time:"18:35", tz:"FR", location:"Saint-Valery-sur-Somme Harbour and Old Town", type:"wander", priority:2, lat:50.1833, lng:1.6333, mapsUrl:"https://maps.google.com/?q=Saint-Valery-sur-Somme+France", reason:"Open-air wander around the harbour, medieval streets and bay views; no vegan food is relied on here.", duration:55 },
        { id:"d1s8", order:7, time:"19:30", tz:"FR", location:"Depart Saint-Valery-sur-Somme", type:"depart", priority:0, lat:50.1833, lng:1.6333, mapsUrl:"https://maps.google.com/?q=Saint-Valery-sur-Somme+France", reason:"Continue to Amiens." },
        { id:"d1s9", order:8, time:"20:45", tz:"FR", location:"Tesla Supercharger Amiens Dury", type:"charging", priority:0, lat:49.8390, lng:2.2870, mapsUrl:"https://maps.google.com/?q=Auchan+Amiens+Route+de+Paris+-+Dury+80000+Amiens+France", reason:"Exact Tesla location. Open 24/7; top up before hotel and Day 2.", duration:30 },
        { id:"d1s10", order:9, time:"21:15", tz:"FR", location:"Mian Miam, Amiens", type:"food", priority:2, lat:49.8934, lng:2.2975, mapsUrl:"https://maps.google.com/?q=Mian+Miam+12+Place+Parmentier+80000+Amiens+France", reason:"Vegan options listed; current hours show evening service until 22:30, so this timing works.", veganFriendly:true, duration:75, planStatus:'primary', veganFit:'wide', openingFit:'ok' },
        { id:"d1s11", order:10, time:"22:30", tz:"FR", location:"Moxy Amiens", type:"hotel", priority:0, lat:49.8941, lng:2.2958, mapsUrl:"https://maps.google.com/?q=Moxy+Amiens+29-33+Rue+Paul+Tellier+80000+Amiens+France", reason:"Overnight stay.", planStatus:'booked' }
      ]
    },
    /* ── Day 2 — Thu 18 Jun — Amiens to Troyes ────────────────────── */
    {
      id: "day2",
      date: "2026-06-18",
      label: "Day 2",
      title: "Amiens to Troyes",
      subtitle: "Floating gardens, medieval roses & half-timbered streets",
      stops: [
        { id:"d2s1", order:1, time:"10:30", tz:"FR", location:"Moxy Amiens", type:"depart", priority:0, lat:49.8941, lng:2.2958, mapsUrl:"https://maps.google.com/?q=Moxy+Amiens+29-33+Rue+Paul+Tellier+80000+Amiens+France", reason:"Breakfast and checkout." },
        { id:"d2s2", order:2, time:"10:45", tz:"FR", location:"Hortillonnages d'Amiens Boat Tour and Walk", type:"experience", priority:3, lat:49.8978, lng:2.3138, mapsUrl:"https://maps.google.com/?q=Hortillonnages+d%27Amiens+54+Boulevard+de+Beauvill%C3%A9+80000+Amiens+France", reason:"Must-visit floating gardens; allow around 45 minutes for the boat and a little time around the site.", duration:60, planStatus:'conditional', openingFit:'risk', bookingRequired:true, risk:'medium', trigger:'Boat tours need advance booking and last tours may be full. Only worthwhile if the boat is available.', sameDayAction:'Call +33 3 22 92 12 18 before leaving hotel to confirm boat availability', decisionDeadline:'10:45 FR',
          alternatives: [
            {
              id:'alt_d2s2_cathedral',
              location:'Amiens Cathedral (Notre-Dame)',
              type:'architecture',
              lat:49.8955, lng:2.3018,
              mapsUrl:'https://maps.google.com/?q=Cath%C3%A9drale+Notre-Dame+d%27Amiens+30+Place+Notre+Dame+80000+Amiens+France',
              reason:'Largest Gothic cathedral in France by volume — UNESCO World Heritage. Free entry, no booking needed, open 08:30–18:30 daily. Guaranteed alternative if Hortillonnages falls through.',
              duration:60,
              veganFit:null,
              openingFit:'ok',
              trigger:'If Hortillonnages boat tour is unavailable, fully booked, or closed',
              sameDayAction:'Walk 15 minutes south from the hotel to the cathedral entrance',
              decisionDeadline:'10:45 FR',
            }
          ]
        },
        { id:"d2s4", order:3, time:"12:00", tz:"FR", location:"Le Colibri, Amiens", type:"food", priority:2, lat:49.8952, lng:2.2978, mapsUrl:"https://maps.google.com/?q=Le+Colibri+Amiens+13+Rue+Dusevel+80000+Amiens+France", reason:"HappyCow lists veganisable dishes and vegan cakes; current Thursday hours cover 12:00–13:00.", veganFriendly:true, duration:75, planStatus:'primary', veganFit:'wide', openingFit:'ok', risk:'low',
          alternatives: [
            {
              id:'alt_d2s4_pokawa',
              location:'Pokawa, Amiens',
              type:'food',
              lat:49.8940, lng:2.3010,
              mapsUrl:'https://maps.google.com/?q=Pokawa+Amiens+France',
              reason:'HappyCow-listed poke bowl chain with wide vegan options. Open daily 11:00–00:00 — reliable backup if Le Colibri is closed or full.',
              duration:60,
              veganFriendly:true,
              veganFit:'wide',
              openingFit:'ok',
              trigger:'If Le Colibri is closed, fully booked, or cannot accommodate the group',
              sameDayAction:'Walk to Pokawa — no booking needed',
              decisionDeadline:'11:45 FR',
            }
          ]
        },
        { id:"d2s5", order:4, time:"13:15", tz:"FR", location:"Depart Amiens", type:"depart", priority:0, lat:49.8942, lng:2.3020, mapsUrl:"https://maps.google.com/?q=Amiens+France", reason:"Head towards Gerberoy." },
        { id:"d2s6", order:5, time:"14:30", tz:"FR", location:"Gerberoy Village Walk", type:"wander", priority:3, lat:49.4853, lng:1.8239, mapsUrl:"https://maps.google.com/?q=Gerberoy+France", reason:"Must-visit rose-covered medieval village — one of the most beautiful in France. Wander the lanes, gardens and viewpoints.", duration:60, planStatus:'conditional', openingFit:'risk', risk:'medium', trigger:'The Le Sidaner rose garden has seasonal opening variations — beautiful in June but check same morning that the gardens are open', sameDayAction:'Check gerberoy.fr or call the village tourist office before setting off from Amiens', decisionDeadline:'12:00 FR',
          alternatives: [
            {
              id:'alt_d2s6_beauvais',
              location:'Beauvais Cathedral (Saint-Pierre)',
              type:'architecture',
              lat:49.4330, lng:2.0817,
              mapsUrl:'https://maps.google.com/?q=Cath%C3%A9drale+Saint-Pierre+de+Beauvais+Rue+Saint-Pierre+60000+Beauvais+France',
              reason:'Highest Gothic choir in the world — open April–October daily 10:00–18:15. On the direct route from Amiens to Troyes, no detour needed.',
              duration:60,
              veganFit:null,
              openingFit:'ok',
              trigger:'If Gerberoy rose gardens are closed or the detour is not worth it given timing',
              sameDayAction:'Beauvais is on the main route — just stop en route to Troyes without doubling back',
              decisionDeadline:'12:00 FR',
            }
          ]
        },
        { id:"d2s8", order:6, time:"15:30", tz:"FR", location:"Depart Gerberoy", type:"depart", priority:0, lat:49.4853, lng:1.8239, mapsUrl:"https://maps.google.com/?q=Gerberoy+France", reason:"Continue towards Troyes." },
        { id:"d2s9", order:7, time:"17:45", tz:"FR", location:"Tesla Supercharger Troyes Saint-Parres", type:"charging", priority:0, lat:48.3265, lng:4.0920, mapsUrl:"https://maps.google.com/?q=Centre+Commercial+Be+Green+Zone+commerciale+de+Saint-Parres-aux-Tertres+10410+Saint-Parres-aux-Tertres+France", reason:"Exact Tesla location. Open 24/7; charge before entering Troyes.", duration:35 },
        { id:"d2s10", order:8, time:"18:20", tz:"FR", location:"Troyes Old Town & Ruelle des Chats", type:"architecture", priority:3, lat:48.2968, lng:4.0735, mapsUrl:"https://maps.google.com/?q=Ruelle+des+Chats+Troyes+France", reason:"Must-visit half-timbered streets and medieval lanes.", placesQuery:"Ruelle des Chats Troyes" },
        { id:"d2s11", order:9, time:"19:00", tz:"FR", location:"Papillon, Troyes", type:"food", priority:2, lat:48.2968, lng:4.0735, mapsUrl:"https://maps.google.com/?q=Papillon+9+Ruelle+des+Chats+10000+Troyes+France", reason:"HappyCow says the vegetarian tasting menu can be made vegan with advance booking; current Thursday dinner hours are 19:00–21:00.", veganFriendly:true, duration:120, planStatus:'conditional', veganFit:'limited', openingFit:'ok', bookingRequired:true, risk:'medium', trigger:'The vegan tasting menu requires advance booking and confirmation — without it you may only get the standard menu with limited adaptation', sameDayAction:'Call Papillon on arrival day (morning) to confirm vegan tasting menu for your party', decisionDeadline:'17:00 FR',
          alternatives: [
            {
              id:'alt_d2s11_libanais',
              location:'Au Libanais, Troyes',
              type:'food',
              lat:48.2968, lng:4.0750,
              mapsUrl:'https://maps.google.com/?q=Au+Libanais+Troyes+France',
              reason:'HappyCow confirms many vegan options on the Lebanese menu. No booking required, good location near the old town. Reliable vegan choice.',
              duration:90,
              veganFriendly:true,
              veganFit:'wide',
              openingFit:'ok',
              trigger:'If Papillon cannot confirm a vegan tasting menu or is fully booked',
              sameDayAction:'Walk to Au Libanais — no booking needed',
              decisionDeadline:'17:00 FR',
            }
          ]
        },
        { id:"d2s12", order:10, time:"21:00", tz:"FR", location:"B&B HOTEL Troyes Centre", type:"hotel", priority:0, lat:48.2990, lng:4.0760, mapsUrl:"https://maps.google.com/?q=B%26B+HOTEL+Troyes+Centre+51+Boulevard+du+14+Juillet+10000+Troyes+France", reason:"Overnight stay." }
      ]
    },
    /* ── Day 3 — Fri 19 Jun — Troyes to Beaune ────────────────────── */
    {
      id: "day3",
      date: "2026-06-19",
      label: "Day 3",
      title: "Troyes to Beaune",
      subtitle: "Burgundy villages, UNESCO abbey & Teams meeting",
      stops: [
        { id:"d3s1", order:1, time:"10:30", tz:"FR", location:"B&B HOTEL Troyes Centre", type:"depart", priority:0, lat:48.2990, lng:4.0760, mapsUrl:"https://maps.google.com/?q=B%26B+HOTEL+Troyes+Centre+51+Boulevard+du+14+Juillet+10000+Troyes+France", reason:"Breakfast and checkout." },
        { id:"d3s2", order:2, time:"12:00", tz:"FR", location:"Flavigny-sur-Ozerain Village Walk", type:"village", priority:3, lat:47.5167, lng:4.5333, mapsUrl:"https://maps.google.com/?q=Flavigny-sur-Ozerain+France", reason:"Must-visit medieval village and anise sweet heritage; open-air wander through lanes and viewpoints.", duration:60, planStatus:'primary', openingFit:'ok', risk:'low' },
        { id:"d3s4", order:3, time:"13:30", tz:"FR", location:"Abbey of Fontenay Visit", type:"architecture", priority:3, lat:47.6378, lng:4.3992, mapsUrl:"https://maps.google.com/?q=Abbaye+de+Fontenay+21500+Marmagne+France", reason:"Must-visit UNESCO abbey; visit the buildings, gardens and exhibitions within published opening hours.", duration:90, planStatus:'conditional', openingFit:'ok', risk:'medium', trigger:'If the day is running 30+ minutes late after Flavigny, skipping Fontenay protects the 16:00 FR Teams presentation — a hard commitment', sameDayAction:'Check your departure time from Troyes — if already late, treat Fontenay as optional today', decisionDeadline:'11:00 FR',
          alternatives: [
            {
              id:'alt_d3s4_direct',
              location:'Direct to Beaune Nord Supercharger',
              type:'charging',
              lat:47.0300, lng:4.8550,
              mapsUrl:'https://maps.google.com/?q=13+Rue+Gustave+Eiffel+21200+Beaune+France',
              reason:'Skip the abbey detour and go directly to Beaune Nord Supercharger. Arrive earlier, charge longer, more buffer before the 16:00 Teams call.',
              openingFit:'ok',
              trigger:'If running 30+ minutes late or the abbey visit would risk the Teams presentation',
              sameDayAction:'Navigate directly to Beaune Nord — 13 Rue Gustave Eiffel, 21200 Beaune',
              decisionDeadline:'11:00 FR',
            }
          ]
        },
        { id:"d3s6", order:4, time:"15:15", tz:"FR", location:"Tesla Supercharger Beaune Nord", type:"charging", priority:0, lat:47.0300, lng:4.8550, mapsUrl:"https://maps.google.com/?q=13+Rue+Gustave+Eiffel+21200+Beaune+France", reason:"Reliable location for the Teams presentation — charging, stable connectivity and nearby coffee." },
        { id:"d3s7", order:5, time:"16:00", tz:"FR", location:"Teams Presentation", type:"work", priority:0, lat:47.0300, lng:4.8550, mapsUrl:"https://maps.google.com/?q=13+Rue+Gustave+Eiffel+21200+Beaune+France", reason:"Present from the Tesla using stable mobile connectivity while charging.", duration:60, photos:["./images/teams-call.jpeg"], planStatus:'anchor', risk:'low', fixed:true },
        { id:"d3s8", order:6, time:"17:00", tz:"FR", location:"Magazzino, Beaune Nord", type:"food", priority:0, lat:47.0300, lng:4.8550, mapsUrl:"https://maps.google.com/?q=Magazzino+88+Route+de+Savigny+21200+Beaune+France", reason:"Italian deli-restaurant right next to the Supercharger — coffee, antipasti and vegan-friendly dishes. Good contingency if the meeting overruns.", veganFriendly:true, duration:30, planStatus:'primary', veganFit:'wide', openingFit:'ok', risk:'low' },
        { id:"d3s9", order:7, time:"17:45", tz:"FR", location:"ibis Styles Beaune Centre", type:"hotel", priority:0, lat:47.0230, lng:4.8370, mapsUrl:"https://maps.google.com/?q=ibis+Styles+Beaune+Centre+7+Boulevard+Perpreuil+21200+Beaune+France", reason:"Check in and freshen up." },
        { id:"d3s10", order:8, time:"18:30", tz:"FR", location:"Beaune Old Town", type:"architecture", priority:2, lat:47.0200, lng:4.8380, mapsUrl:"https://maps.google.com/?q=Hospices+de+Beaune+France", reason:"Evening wander around the historic centre.", placesQuery:"Hospices de Beaune" },
        { id:"d3s11", order:9, time:"19:30", tz:"FR", location:"Brasserie Le Carnot, Beaune", type:"food", priority:2, lat:47.0213, lng:4.8395, mapsUrl:"https://maps.google.com/?q=Brasserie+Le+Carnot+18+Rue+Carnot+21200+Beaune+France", reason:"HappyCow lists a clearly marked vegan dish; current Friday opening covers dinner.", veganFriendly:true, duration:90, planStatus:'weak-vegan', veganFit:'single', openingFit:'ok', risk:'low', trigger:'Only one clearly marked vegan dish — acceptable if no better option but worth trying the alternatives first',
          alternatives: [
            {
              id:'alt_d3s11_toma',
              location:'TOMA Restaurant, Beaune',
              type:'food',
              lat:47.0215, lng:4.8390,
              mapsUrl:'https://maps.google.com/?q=TOMA+Restaurant+Beaune+France',
              reason:'HappyCow-listed with wide vegan choice. Open Friday–Sunday 12:00–22:00 — directly applicable on a Friday evening.',
              duration:90,
              veganFriendly:true,
              veganFit:'wide',
              openingFit:'ok',
              trigger:'Preferred over Le Carnot — better vegan range, open Friday evening',
              sameDayAction:'Check TOMA for a table — better vegan choice for a Friday dinner',
              decisionDeadline:'17:30 FR',
            },
            {
              id:'alt_d3s11_m7',
              location:'M7 Restaurant, Beaune',
              type:'food',
              lat:47.0200, lng:4.8385,
              mapsUrl:'https://maps.google.com/?q=M7+Restaurant+Beaune+France',
              reason:'Open every day for lunch and dinner — reliable daily option with vegan dishes available.',
              duration:90,
              veganFriendly:true,
              veganFit:'wide',
              openingFit:'ok',
              trigger:'If TOMA is full or unavailable — M7 is open daily and a solid backup',
              sameDayAction:'Walk to M7 — no booking needed',
              decisionDeadline:'18:00 FR',
            }
          ]
        },
        { id:"d3s12", order:10, time:"21:00", tz:"FR", location:"ibis Styles Beaune Centre", type:"hotel", priority:0, lat:47.0230, lng:4.8370, mapsUrl:"https://maps.google.com/?q=ibis+Styles+Beaune+Centre+7+Boulevard+Perpreuil+21200+Beaune+France", reason:"Overnight stay." }
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
        { id:"d4s1", order:1, time:"10:30", tz:"FR", location:"ibis Styles Beaune Centre", type:"depart", priority:0, lat:47.0230, lng:4.8370, mapsUrl:"https://maps.google.com/?q=ibis+Styles+Beaune+Centre+7+Boulevard+Perpreuil+21200+Beaune+France", reason:"Breakfast and checkout. Today is the big day — Annecy!" },
        { id:"d4s2", order:2, time:"13:30", tz:"FR", location:"Tesla Supercharger Annecy-Seynod", type:"charging", priority:0, lat:45.8833, lng:6.1000, mapsUrl:"https://maps.google.com/?q=G+La+Galerie+Val+Semnoz+Avenue+d%27Aix-les-Bains+74600+Seynod+France", reason:"Exact Tesla location. Open 24/7; charge to 95–100% for the festival week and the Geneva airport pickup.", duration:45 },
        { id:"d4s3", order:3, time:"14:15", tz:"FR", location:"Depart Annecy-Seynod Supercharger", type:"depart", priority:0, lat:45.8833, lng:6.1000, mapsUrl:"https://maps.google.com/?q=G+La+Galerie+Val+Semnoz+Avenue+d%27Aix-les-Bains+74600+Seynod+France", reason:"Final short drive to the accommodation." },
        { id:"d4s4", order:4, time:"14:45", tz:"FR", location:"Chalet de Charme avec Vue Splendide", type:"hotel", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l%27Arete+74290+Menthon-Saint-Bernard+France", reason:"Arrive and unpack. Spectacular views over Lake Annecy from the terrace.", planStatus:'booked', risk:'low', photos:["https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Menthon-Saint-Bernard_-_Lac_Annecy.jpg/1280px-Menthon-Saint-Bernard_-_Lac_Annecy.jpg"] },
        { id:"d4s5", order:5, time:"20:00", tz:"FR", location:"Geneva Airport — French Side", type:"transport", priority:0, lat:46.2380, lng:6.1090, mapsUrl:"https://maps.google.com/?q=Route+Douaniere+01210+Ferney-Voltaire+France", reason:"Navigate to the French sector only; family should follow France or Secteur Francais signs. Family lands at 20:20.", planStatus:'anchor', risk:'low', fixed:true }
      ]
    },
    /* ── Festival Week — Sun 21 Jun to Fri 26 Jun (individual days) ─── */
    {
      id: "fest_sun",
      date: "2026-06-21",
      label: "Sunday",
      title: "Festival — Sunday",
      subtitle: "Annecy International Animation Festival 2026",
      isFestival: true,
      stops: [
        { id:"fs2",  order:1, time:"09:00", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"depart", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l+Arete+74290+Menthon-Saint-Bernard", reason:"Leave the chalet and head into Annecy." },
        { id:"fs6",  order:2, time:"10:00", tz:"FR", location:"Château de Menthon-Saint-Bernard", type:"architecture", priority:3, lat:45.8566, lng:6.2037, mapsUrl:"https://maps.google.com/?q=Chateau+de+Menthon-Saint-Bernard", reason:"Fairytale château right next to your chalet, said to have inspired Sleeping Beauty. Open for guided tours — extraordinary lake views from the ramparts.", duration:90 },
        { id:"fs4",  order:3, time:"13:00", tz:"FR", location:"Annecy Old Town", type:"wander", priority:3, lat:45.8992, lng:6.1294, mapsUrl:"https://maps.google.com/?q=Vieille+Ville+Annecy", reason:"Canal-laced old town with colourful flower-lined buildings, the 12th-century Palais de l'Isle and lively café terraces.", placesQuery:"Vieille Ville Annecy", duration:90 },
        { id:"fs14", order:4, time:"15:00", tz:"FR", location:"Palais de l'Isle, Annecy", type:"architecture", priority:3, lat:45.8995, lng:6.1287, mapsUrl:"https://maps.google.com/?q=Palais+de+l+Isle+Annecy", reason:"The most photographed building in Annecy — 12th-century island prison on the Thiou canal. Now a local history museum and one of the most iconic sights in France.", duration:60 },
        { id:"fs10", order:5, time:"17:00", tz:"FR", location:"Pont des Amours & Jardins de l'Europe", type:"wander", priority:2, lat:45.9011, lng:6.1278, mapsUrl:"https://maps.google.com/?q=Pont+des+Amours+Annecy", reason:"The romantic canal bridge and lakeside gardens with weeping willows, swans and mountain views — perfect for a morning stroll or evening walk.", duration:45 },
        { id:"fret_sun", order:6, time:"18:00", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"hotel", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l%27Arete+74290+Menthon-Saint-Bernard+France", reason:"Return to the chalet for the evening.", photos:["https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Menthon-Saint-Bernard_-_Lac_Annecy.jpg/1280px-Menthon-Saint-Bernard_-_Lac_Annecy.jpg"] }
      ]
    },
    {
      id: "fest_mon",
      date: "2026-06-22",
      label: "Monday",
      title: "Festival — Monday",
      subtitle: "Annecy International Animation Festival 2026",
      isFestival: true,
      stops: [
        { id:"fdep_mon", order:0, time:"08:45", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"depart", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l%27Arete+74290+Menthon-Saint-Bernard+France", reason:"Leave the chalet — ~15 min drive into Annecy.", photos:["https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Menthon-Saint-Bernard_-_Lac_Annecy.jpg/1280px-Menthon-Saint-Bernard_-_Lac_Annecy.jpg"] },
        { id:"fs1",  order:1, time:"09:00", tz:"FR", location:"Annecy Town Centre", type:"festival", priority:3, lat:45.8992, lng:6.1294, mapsUrl:"https://maps.google.com/?q=Annecy+France", reason:"International Animation Film Festival 2026 — screenings, exhibitions and events throughout the town. Main venues: Bonlieu Theatre, the Pâquier park and the Imperial Palace on the lake.", duration:60 },
        { id:"fs5",  order:2, time:"11:00", tz:"FR", location:"Château d'Annecy", type:"architecture", priority:2, lat:45.9004, lng:6.1279, mapsUrl:"https://maps.google.com/?q=Chateau+d+Annecy", reason:"Hilltop castle with panoramic views over the lake and old town. Houses the Musée d'Annecy — regional art, natural history and Alpine life.", duration:90 },
        { id:"fs11", order:3, time:"13:00", tz:"FR", location:"Le Green Café, Annecy", type:"food", priority:3, lat:45.8990, lng:6.1290, mapsUrl:"https://maps.google.com/?q=Le+Green+Cafe+Annecy", reason:"One of Annecy's best vegan-friendly spots, close to the Bonlieu festival venue. Salads, wraps and fresh juices — great for a quick festival lunch.", veganFriendly:true, duration:60 },
        { id:"fret_mon", order:4, time:"14:15", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"hotel", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l%27Arete+74290+Menthon-Saint-Bernard+France", reason:"Return to the chalet for the evening.", photos:["https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Menthon-Saint-Bernard_-_Lac_Annecy.jpg/1280px-Menthon-Saint-Bernard_-_Lac_Annecy.jpg"] }
      ]
    },
    {
      id: "fest_tue",
      date: "2026-06-23",
      label: "Tuesday",
      title: "Festival — Tuesday",
      subtitle: "Annecy International Animation Festival 2026",
      isFestival: true,
      stops: [
        { id:"fdep_tue", order:-1, time:"08:45", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"depart", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l%27Arete+74290+Menthon-Saint-Bernard+France", reason:"Leave the chalet — ~15 min drive into Annecy.", photos:["https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Menthon-Saint-Bernard_-_Lac_Annecy.jpg/1280px-Menthon-Saint-Bernard_-_Lac_Annecy.jpg"] },
        { id:"show_tue1", order:0, time:"09:00", tz:"FR", type:"showing", title:"Discovering Nakalimutan, the Forgotten Island", location:"Bonlieu Scène nationale", duration:180, ticketed:false, queueMins:0, ownerOnly:true, lat:45.8998, lng:6.1296, mapsUrl:"https://maps.google.com/?q=Bonlieu+Scene+Nationale+Annecy", reason:"DreamWorks competition feature. Grande Salle — no ticket, arrive time already includes queue." },
        { id:"fs3",  order:1, time:"10:00", tz:"FR", location:"Lake Annecy", type:"experience", priority:3, lat:45.8667, lng:6.1833, mapsUrl:"https://maps.google.com/?q=Lac+Annecy", reason:"Swimming, cycling and boat trips on one of Europe's clearest lakes. Hire bikes in Annecy and follow the lakeside path all the way to Talloires — flat and stunning.", duration:120 },
        { id:"fs7",  order:2, time:"13:00", tz:"FR", location:"Talloires", type:"village", priority:3, lat:45.8311, lng:6.2178, mapsUrl:"https://maps.google.com/?q=Talloires+France", reason:"Stunning village on the lake's east shore with a 17th-century abbey, café terraces and tranquil abbey gardens. 20 minutes from the chalet by road or bike.", duration:90 },
        { id:"fs13", order:3, time:"19:00", tz:"FR", location:"Brasserie des Européens, Annecy", type:"food", priority:2, lat:45.8994, lng:6.1300, mapsUrl:"https://maps.google.com/?q=Brasserie+des+Europeens+Annecy", reason:"Relaxed brasserie near the Bonlieu with terrace dining and plant-based options — a reliable choice for festival lunches and casual dinners.", veganFriendly:true, duration:90 },
        { id:"fret_tue", order:4, time:"20:45", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"hotel", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l%27Arete+74290+Menthon-Saint-Bernard+France", reason:"Return to the chalet for the evening.", photos:["https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Menthon-Saint-Bernard_-_Lac_Annecy.jpg/1280px-Menthon-Saint-Bernard_-_Lac_Annecy.jpg"] }
      ]
    },
    {
      id: "fest_wed",
      date: "2026-06-24",
      label: "Wednesday",
      title: "Festival — Wednesday",
      subtitle: "Annecy International Animation Festival 2026",
      isFestival: true,
      stops: [
        { id:"fdep_wed", order:0, time:"09:45", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"depart", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l%27Arete+74290+Menthon-Saint-Bernard+France", reason:"Leave the chalet — ~15 min drive into Annecy.", photos:["https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Menthon-Saint-Bernard_-_Lac_Annecy.jpg/1280px-Menthon-Saint-Bernard_-_Lac_Annecy.jpg"] },
        { id:"fs8",  order:1, time:"10:00", tz:"FR", location:"Gorges du Fier", type:"experience", priority:2, lat:45.9167, lng:6.0333, mapsUrl:"https://maps.google.com/?q=Gorges+du+Fier+Lovagny", reason:"Spectacular narrow gorge with suspended walkways over rushing glacial water — dramatic and unique. 20 minutes west of Annecy.", duration:90 },
        { id:"show_wed1", order:2, time:"11:00", tz:"FR", type:"showing", title:"Wildwood", location:"Cinéma de la Cité Internationale", duration:180, ticketed:false, queueMins:0, ownerOnly:true, lat:45.9012, lng:6.1332, mapsUrl:"https://maps.google.com/?q=Cinema+Cite+Internationale+13+Rue+de+la+Paix+Annecy", reason:"Festival screening at Cité Internationale. No ticket — arrive time includes queue." },
        { id:"show_wed2", order:3, time:"11:00", tz:"FR", type:"showing", title:"Next on Netflix Animation", location:"Bonlieu Scène nationale", duration:240, ticketed:false, queueMins:0, ownerOnly:true, lat:45.8998, lng:6.1296, mapsUrl:"https://maps.google.com/?q=Bonlieu+Scene+Nationale+Annecy", reason:"Netflix Animation preview showcase. Grande Salle — no ticket, arrive time already includes queue." },
        { id:"fs12", order:4, time:"13:00", tz:"FR", location:"L'Aromatic, Annecy", type:"food", priority:2, lat:45.8998, lng:6.1280, mapsUrl:"https://maps.google.com/?q=L+Aromatic+Annecy", reason:"Popular vegan-friendly restaurant near the old town — fresh seasonal dishes, good wine list and a relaxed atmosphere away from the festival crowds.", veganFriendly:true, duration:90 },
        { id:"fret_wed", order:5, time:"14:45", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"hotel", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l%27Arete+74290+Menthon-Saint-Bernard+France", reason:"Return to the chalet for the evening.", photos:["https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Menthon-Saint-Bernard_-_Lac_Annecy.jpg/1280px-Menthon-Saint-Bernard_-_Lac_Annecy.jpg"] }
      ]
    },
    {
      id: "fest_thu",
      date: "2026-06-25",
      label: "Thursday",
      title: "Festival — Thursday",
      subtitle: "Annecy International Animation Festival 2026",
      isFestival: true,
      stops: [
        { id:"fdep_thu", order:0, time:"09:45", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"depart", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l%27Arete+74290+Menthon-Saint-Bernard+France", reason:"Leave the chalet — ~15 min drive into Annecy.", photos:["https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Menthon-Saint-Bernard_-_Lac_Annecy.jpg/1280px-Menthon-Saint-Bernard_-_Lac_Annecy.jpg"] },
        { id:"fs9",  order:1, time:"10:00", tz:"FR", location:"Château de Thorens", type:"architecture", priority:2, lat:45.9833, lng:6.2000, mapsUrl:"https://maps.google.com/?q=Chateau+de+Thorens+France", reason:"Medieval castle in the hills north of Annecy associated with Saint Francis de Sales. Far less visited than the town castle and very atmospheric.", duration:90 },
        { id:"fs15", order:2, time:"19:00", tz:"FR", location:"HappyCow Vegan Map, Annecy", type:"food", priority:2, lat:45.8992, lng:6.1294, mapsUrl:"https://www.happycow.net/europe/france/annecy/", reason:"Browse all vegan and vegan-friendly restaurants near your current location in Annecy.", veganFriendly:true, duration:60 },
        { id:"show_thu1", order:3, time:"20:00", tz:"FR", type:"showing", title:"Walking with Animators #8", location:"Pathé Cinémas", duration:165, ticketed:false, queueMins:0, ownerOnly:true, lat:45.8965, lng:6.1308, mapsUrl:"https://maps.google.com/?q=Pathe+Cinemas+7+Avenue+de+Brogny+Annecy", reason:"Annual showcase of animators' personal films. A festival institution — held at Pathé." },
        { id:"fret_thu", order:4, time:"23:00", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"hotel", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l%27Arete+74290+Menthon-Saint-Bernard+France", reason:"Return to the chalet for the night.", photos:["https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Menthon-Saint-Bernard_-_Lac_Annecy.jpg/1280px-Menthon-Saint-Bernard_-_Lac_Annecy.jpg"] }
      ]
    },
    {
      id: "fest_fri",
      date: "2026-06-26",
      label: "Friday",
      title: "Festival — Friday",
      subtitle: "Annecy International Animation Festival 2026 — Final day",
      isFestival: true,
      stops: [
        { id:"fdep_fri", order:0, time:"08:45", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"depart", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l%27Arete+74290+Menthon-Saint-Bernard+France", reason:"Leave the chalet — ~15 min drive into Annecy.", photos:["https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Menthon-Saint-Bernard_-_Lac_Annecy.jpg/1280px-Menthon-Saint-Bernard_-_Lac_Annecy.jpg"] },
        { id:"show_fri1", order:1, time:"09:00", tz:"FR", type:"showing", title:"Walt Disney Showcase", location:"Bonlieu Scène nationale", duration:165, ticketed:false, queueMins:0, ownerOnly:true, lat:45.8998, lng:6.1296, mapsUrl:"https://maps.google.com/?q=Bonlieu+Scene+Nationale+Annecy", reason:"Walt Disney Animation Studios showcase. Grande Salle — no ticket, arrive time already includes queue." },
        { id:"show_fri2", order:2, time:"11:45", tz:"FR", type:"showing", title:"Pixar", location:"Bonlieu Scène nationale", duration:150, ticketed:false, queueMins:0, ownerOnly:true, lat:45.8998, lng:6.1296, mapsUrl:"https://maps.google.com/?q=Bonlieu+Scene+Nationale+Annecy", reason:"Pixar Animation Studios showcase. Grande Salle — no ticket, arrive time already includes queue." },
        { id:"fret_fri", order:3, time:"14:30", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"hotel", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l%27Arete+74290+Menthon-Saint-Bernard+France", reason:"Return to the chalet for the final evening.", photos:["https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Menthon-Saint-Bernard_-_Lac_Annecy.jpg/1280px-Menthon-Saint-Bernard_-_Lac_Annecy.jpg"] },
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
        { id:"d5s1", order:1, time:"10:30", tz:"FR", location:"Chalet, Menthon-Saint-Bernard", type:"depart", priority:0, lat:45.8533, lng:6.2050, mapsUrl:"https://maps.google.com/?q=195+Chemin+de+l%27Arete+74290+Menthon-Saint-Bernard+France", reason:"Leave after breakfast and begin the return journey north." },
        { id:"d5s2", order:2, time:"13:45", tz:"FR", location:"Saline Royale d'Arc-et-Senans Visit", type:"architecture", priority:3, lat:47.0333, lng:5.7833, mapsUrl:"https://maps.google.com/?q=Saline+Royale+d%27Arc-et-Senans+Grande+Rue+25610+Arc-et-Senans+France", reason:"Must-visit UNESCO industrial architecture; visit the buildings, gardens and exhibitions within published opening hours.", duration:105, planStatus:'primary', openingFit:'ok', risk:'low',
          alternatives: [
            {
              id:'alt_d5s2_direct',
              location:'Direct to Besançon Old Town',
              type:'architecture',
              lat:47.2378, lng:6.0241,
              mapsUrl:'https://maps.google.com/?q=Besancon+Old+Town+France',
              reason:'Skip the UNESCO detour and head straight to Besançon for more time in the city and a less rushed evening.',
              openingFit:'ok',
              trigger:'If time is tight, weather is poor, or Saline Royale is closed',
              sameDayAction:'Skip the Saline detour and drive direct to Besançon Supercharger',
              decisionDeadline:'12:00 FR',
            }
          ]
        },
        { id:"d5s4", order:3, time:"16:15", tz:"FR", location:"Tesla Supercharger Besançon Châteaufarine", type:"charging", priority:0, lat:47.2500, lng:6.0200, mapsUrl:"https://maps.google.com/?q=Centre+Commercial+Besan%C3%A7on+Ch%C3%A2teaufarine+Rue+Andr%C3%A9+Breton+25000+Besan%C3%A7on+France", reason:"Exact Tesla location. Open 24/7; practical charge before the evening.", duration:30 },
        { id:"d5s5", order:4, time:"16:45", tz:"FR", location:"Besançon Old Town", type:"architecture", priority:2, lat:47.2378, lng:6.0241, mapsUrl:"https://maps.google.com/?q=Besancon+Old+Town+France", reason:"Riverside city walk with arcades, old streets and views.", placesQuery:"Citadelle de Besançon" },
        { id:"d5s6", order:5, time:"19:00", tz:"FR", location:"L'Alsacien, Besançon", type:"food", priority:2, lat:47.2350, lng:6.0175, mapsUrl:"https://maps.google.com/?q=L%27Alsacien+Besancon+2+Quai+Vauban+25000+Besancon+France", reason:"HappyCow lists vegan flammkuchen; current Saturday opening runs late enough for dinner.", veganFriendly:true, duration:120, planStatus:'primary', veganFit:'limited', openingFit:'ok', risk:'low', trigger:'Vegan flammkuchen confirmed but limited vegan range — check if the full party is happy with limited choice',
          alternatives: [
            {
              id:'alt_d5s6_veggies',
              location:"Veggie's Corner, Besançon",
              type:'food',
              lat:47.2360, lng:6.0200,
              mapsUrl:"https://maps.google.com/?q=Veggie%27s+Corner+Besancon+France",
              reason:"Fully vegan restaurant confirmed on HappyCow. Open Saturday evening — the best vegan option for this night.",
              duration:90,
              veganFriendly:true,
              veganFit:'full',
              openingFit:'ok',
              trigger:"Preferred over L'Alsacien if the whole party wants a fully vegan menu",
              sameDayAction:"Check Veggie's Corner opening times and book if required",
              decisionDeadline:'17:00 FR',
            },
            {
              id:'alt_d5s6_cocelle',
              location:'Maison Cocoëlle, Besançon',
              type:'food',
              lat:47.2378, lng:6.0250,
              mapsUrl:'https://maps.google.com/?q=Maison+Cocoelle+Besancon+France',
              reason:"All-vegan patisserie open Saturday 12:00–18:30. Good for an afternoon cake and coffee stop rather than dinner.",
              duration:30,
              veganFriendly:true,
              veganFit:'full',
              openingFit:'ok',
              trigger:'Good supplement for an afternoon sweet stop before dinner, not a dinner replacement',
              sameDayAction:'Stop at Cocoëlle on the way from the Supercharger to the old town',
              decisionDeadline:'16:00 FR',
            }
          ]
        },
        { id:"d5s7", order:6, time:"21:00", tz:"FR", location:"B&B HOTEL Besançon Valentin", type:"hotel", priority:0, lat:47.2500, lng:6.0100, mapsUrl:"https://maps.google.com/?q=B%26B+HOTEL+Besan%C3%A7on+Valentin+3+Chemin+des+Trois+Croix+25480+Besan%C3%A7on+France", reason:"Overnight stay." }
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
        { id:"d6s1", order:1, time:"10:30", tz:"FR", location:"B&B HOTEL Besançon Valentin", type:"depart", priority:0, lat:47.2500, lng:6.0100, mapsUrl:"https://maps.google.com/?q=B%26B+HOTEL+Besan%C3%A7on+Valentin+3+Chemin+des+Trois+Croix+25480+Besan%C3%A7on+France", reason:"Breakfast and checkout. Long drive day — Rouen via Giverny." },
        { id:"d6s2", order:2, time:"14:30", tz:"FR", location:"Tesla Supercharger Chartres", type:"charging", priority:0, lat:48.4497, lng:1.4803, mapsUrl:"https://maps.google.com/?q=24+Avenue+Gustave+Eiffel+28000+Chartres+France", reason:"Exact Tesla location. Open 24/7; mid-route charge towards Normandy.", duration:30 },
        { id:"d6s3", order:3, time:"16:30", tz:"FR", location:"Fondation Claude Monet, Giverny Visit", type:"experience", priority:3, lat:49.0762, lng:1.5345, mapsUrl:"https://maps.google.com/?q=Fondation+Claude+Monet+Giverny+84+Rue+Claude+Monet+27620+Giverny+France", reason:"Must-visit gardens; current 2026 hours are 10:00–18:00 with last admission at 17:30. Visit duration sits inside opening hours before 18:00 close.", duration:80, planStatus:'primary', openingFit:'ok', risk:'low', sameDayAction:'Last admission is 17:30 — current planned arrival 16:30 is safe. Do not delay the Chartres charge stop.', decisionDeadline:'15:30 FR' },
        { id:"d6s5", order:4, time:"19:00", tz:"FR", location:"Rouen Old Town", type:"architecture", priority:3, lat:49.4431, lng:1.0993, mapsUrl:"https://maps.google.com/?q=Rouen+Old+Town+France", reason:"Must-visit half-timbered streets and cathedral area.", placesQuery:"Cathédrale Notre-Dame de Rouen" },
        { id:"d6s6", order:5, time:"19:30", tz:"FR", location:"Le Joubeil, Rouen", type:"food", priority:2, lat:49.4431, lng:1.0993, mapsUrl:"https://maps.google.com/?q=Le+Joubeil+52+Rue+des+Augustins+76000+Rouen+France", reason:"HappyCow lists vegan mezze and TheFork identifies it as open Sunday; book ahead.", veganFriendly:true, duration:120, planStatus:'primary', veganFit:'wide', openingFit:'check', bookingRequired:true, risk:'medium', trigger:'TheFork confirms Sunday opening but restaurant hours can change — recheck and book same day', sameDayAction:'Book via TheFork or call ahead for Sunday evening before leaving Giverny', decisionDeadline:'17:00 FR',
          alternatives: [
            {
              id:'alt_d6s6_cancan',
              location:'Cancan, Rouen',
              type:'food',
              lat:49.4430, lng:1.0985,
              mapsUrl:'https://maps.google.com/?q=Cancan+Rouen+France',
              reason:'Full vegan menu confirmed. Open daily 19:00–00:00 — no booking needed, guaranteed vegan choice in Rouen.',
              duration:120,
              veganFriendly:true,
              veganFit:'full',
              openingFit:'ok',
              trigger:'If Le Joubeil is closed Sunday, fully booked, or cannot confirm vegan mezze availability',
              sameDayAction:'Walk to Cancan — no booking needed, opens 19:00',
              decisionDeadline:'17:30 FR',
            }
          ]
        },
        { id:"d6s7", order:6, time:"21:30", tz:"FR", location:"B&B HOTEL Rouen Centre Rive Droite", type:"hotel", priority:0, lat:49.4431, lng:1.0993, mapsUrl:"https://maps.google.com/?q=B%26B+HOTEL+Rouen+Centre+Rive+Droite+56+Quai+Gaston+Boulet+76000+Rouen+France", reason:"Overnight stay." }
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
        { id:"d7s1", order:1, time:"10:30", tz:"FR", location:"B&B HOTEL Rouen Centre Rive Droite", type:"depart", priority:0, lat:49.4431, lng:1.0993, mapsUrl:"https://maps.google.com/?q=B%26B+HOTEL+Rouen+Centre+Rive+Droite+56+Quai+Gaston+Boulet+76000+Rouen+France", reason:"Breakfast and checkout. Final morning in France." },
        { id:"d7s2", order:2, time:"13:00", tz:"FR", location:"Tesla Supercharger Calais Coquelles", type:"charging", priority:0, lat:50.9283, lng:1.8167, mapsUrl:"https://maps.google.com/?q=L%27Haut%27Aile+ZAC+Les+Terrasses+Avenue+des+Longues+Pieces+62231+Coquelles+France", reason:"Exact Tesla location. Open 24/7; charge and take a short break before check-in.", duration:75 },
        { id:"d7s3", order:3, time:"14:20", tz:"FR", location:"LeShuttle Check-In, Calais", type:"transport", priority:0, lat:50.9513, lng:1.8587, mapsUrl:"https://maps.google.com/?q=LeShuttle+Calais+Terminal", reason:"Arrive with margin for the booked return crossing." },
        { id:"d7s4", order:4, time:"15:36", tz:"FR", location:"LeShuttle Departure", type:"transport", priority:0, lat:50.9513, lng:1.8587, mapsUrl:"https://maps.google.com/?q=LeShuttle+Calais+Terminal", reason:"Booked return crossing — approximately 35 minutes through the tunnel.", planStatus:'anchor', risk:'low', fixed:true },
        { id:"d7s5", order:5, time:"15:11", tz:"UK", location:"LeShuttle Folkestone Arrival", type:"transport", priority:0, lat:51.0940, lng:1.1430, mapsUrl:"https://maps.google.com/?q=LeShuttle+Folkestone+Terminal", reason:"Back in the UK. Nearly home." },
        { id:"d7s6", order:6, time:"18:30", tz:"UK", location:"North Cadbury — Home", type:"hotel", priority:0, lat:51.0333, lng:-2.5333, mapsUrl:"https://maps.google.com/?q=North+Cadbury+Somerset", reason:"Arrive home. Holiday complete." }
      ]
    }
  ]
};
