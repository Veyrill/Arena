// ===== TRYB DEWELOPERSKI =====
// Włączany/wyłączany przyciskiem "DEV" w lewym dolnym rogu strony (zapamiętywany w przeglądarce).
// WŁ  = testy: 999 każdego surowca, 100 000 złota, łowienie każdej ryby bez względu na FP, ulepszanie wędki za 1 karasia, wszyscy przeciwnicy mają 1 HP (przełącznik w panelu DEV)
// WYŁ = normalna gra od zera (domyślnie)
export const DEV = (() => { try { return localStorage.getItem('arena_dev') === '1'; } catch (e) { return false; } })();
// PANEL DEV – przełączniki (localStorage 'arena_dev_<k>' = '1' / '0'; brak = wartość domyślna). Działają tylko w DEV.
// Panel działa w obu trybach; ustawienia osobno dla DEV ('arena_dev_…') i zwykłej gry ('arena_nrm_…'). W zwykłej grze wszystko domyślnie wyłączone.
export const PANEL_KEY = DEV ? 'arena_dev_' : 'arena_nrm_';
export const devFlag = (k, def) => { const d = DEV ? def : false; try { const v = localStorage.getItem(PANEL_KEY + k); return v === null ? d : v === '1'; } catch (e) { return d; } };
// PRZEWIJANIE CZASU (panel, oba tryby): Date.now() zwraca prawdziwy czas + przesunięcie (localStorage 'arena_dev_toff', ms).
// Działa dla wszystkiego, co liczy czas: łowienie, przerwy w lochu, sklep, buffy, jedzenie. Ustawiane przed wczytaniem reszty gry.
export const DEV_TIME = { off: 0, real: Date.now.bind(Date) };
try { DEV_TIME.off = +localStorage.getItem(PANEL_KEY + 'toff') || 0; } catch (e) {} if (DEV_TIME.off) Date.now = () => DEV_TIME.real() + DEV_TIME.off;   // przewinięcie czasu (oba tryby)
export const setTimeOff = v => { DEV_TIME.off = v; Date.now = () => DEV_TIME.real() + DEV_TIME.off; try { localStorage.setItem(PANEL_KEY + 'toff', v); } catch (e) {} };

export const R=(a,b)=>a+Math.random()*(b-a);
export const I=(a,b)=>Math.floor(R(a,b+1));
export const P=a=>a[I(0,a.length-1)];

export const SL={weapon:['🗡️','Weapon'],helm:['⛑️','Helmet'],armor:['🦺','Armor'],shield:['🛡️','Shield'],boots:['👢','Boots'],ring:['💍','Ring'],amulet:['📿','Amulet'],trinket:['🧿','Talisman'],gloves:['🧤','Gloves']};
// NAZWY = GRAFIKI: każda nazwa ma dokładnie jedną grafikę (ui.js → NAME_SPRITE), więc wygląd przedmiotu zawsze pasuje do nazwy. Akt 1: po 3 na slot.
export const NAMES={weapon:['Sword','Axe','Mace'],helm:['Helmet','Hood','Cap'],armor:['Chainmail','Cuirass','Tunic'],boots:['Leather Boots','Steel Boots','Fur Boots'],ring:['Ring','Signet','Band'],amulet:['Emerald Amulet','Frost Amulet','Ruby Amulet'],trinket:['Chalice','Stone of Hope','Lucky Clover'],shield:['Wooden Shield','Ruby Shield','Emerald Shield'],gloves:['Leather Gloves','Steel Gauntlets','Fur Mittens']};
// WYGLĄD PRZEDMIOTÓW WG AKTU (tylko nazwa i grafika – statystyki bez zmian). ACT_NAMES[a] = nazwy losowane w akcie a (0 = akt 1).
// Slot bez nazw w danym akcie → nazwy z najbliższego wcześniejszego aktu (np. akt 3 bez własnych zbroi → zbroje z aktu 2).
export const ACT_NAMES=[NAMES,{armor:['Plate Armor','Scale Mail','Brigandine'],shield:['Knight Shield','Drake Shield','Shadow Shield'],helm:['Knight Helm','Drake Helm','Shadow Helm']},{}];
export const namesFor=(act,sl)=>{for(let a=Math.min(act||0,ACT_NAMES.length-1);a>=0;a--)if(ACT_NAMES[a][sl])return ACT_NAMES[a][sl];return NAMES[sl];};
// 6 rzadkości: common, uncommon, rare, epic, legendary (złota ramka), mythic (czerwona ramka)
export const RAR=[['Common',1],['Uncommon',1.4],['Rare',1.9],['Epic',2.6],['Legendary',3.4],['Mythic',4.4]];
export const ST={str:'Strength',dex:'Dexterity',con:'Vitality',dmg:'Damage',arm:'Armor'};

// grp = grupa w plecaku: nowe materiały trafiają obok materiałów z tej samej grupy ('upg' = ulepszacze/surowce z potworów, 'fish' = ryby)
// img = grafika z folderu assets (ścieżka względem assets/). Bez img (albo gdy pliku brak) pokazywane jest emoji z "e".
export const MATS={
  meat:{sl:'meat',grp:'upg',name:'Meat',val:10,e:'🥩',img:'materials/mat_meat.png',source:'Forest animals (Lynx, Boar, Deer, Wolf, Bear)'},
  claw:{sl:'claw',grp:'upg',name:'Bear Paw',val:20,e:'🐾',img:'materials/mat_bear_paw.png',source:'Bear (Forest)'},
  fish_carp:{sl:'fish_carp',grp:'fish',name:'Crucian Carp',val:15,e:'🐟',img:'fish/fish_carp.png',source:'Fishing (requires 20 FP)'},
  // Kość: ulepszacz (jakość Zwykła). Wypada ze szkieletów na Cmentarzu.
  bone:{sl:'bone',grp:'upg',name:'Bone',val:10,e:'🦴',img:'materials/mat_bone.png',source:'Graveyard (Skeleton, Skeleton Warrior, Skeleton Mage, Ghoul)'},
  // Czaszka: ulepszacz (jakość Zwykła), jak kość. Wypada z Nekromanty na Cmentarzu.
  skull:{sl:'skull',grp:'upg',name:'Skull',val:25,e:'💀',img:'materials/mat_skull.png',source:'Graveyard (Necromancer)'},
  // r:1 = Niezwykły (zielona ramka). desc = dodatkowa linia w opisie.
  // Oko dorsza – materiał (uncommon); 5% z każdego złowionego Dorsza (wielokrotnie, łączy się w stos). Zastosowanie: do ustalenia
  eye_of_cod:{sl:'eye_of_cod',grp:'fish',name:'Eye of Cod',val:30,e:'👁️',r:1,img:'materials/eye_of_cod.png',source:'Fishing (Cod)'},
  fish_cod:{sl:'fish_cod',grp:'fish',name:'Cod',val:40,e:'🐠',r:1,img:'fish/fish_cod.png',source:'Fishing (requires 85 FP)',desc:'Rod upgrade material (green → blue)'},
  // NOWE RYBY (kolejność z hierarchii): Sum → Barrakuda → Żabnica → Rekin → Lewiatan
  // r: 2 = Rzadki (niebieska ramka), 3 = Epicki (fioletowa), 4 = Legendarny (złota). Mityczny (5) mają TYLKO unikaty (+ mityczna wędka i haczyk)
  // source: wymagane FP (to samo co FISH[].fp)
  fish_catfish:{sl:'fish_catfish',grp:'fish',name:'Catfish',val:80,e:'🐟',r:2,img:'fish/fish_catfish.png',source:'Fishing (requires 170 FP)'},
  fish_barracuda:{sl:'fish_barracuda',grp:'fish',name:'Barracuda',val:150,e:'🐟',r:2,img:'fish/fish_barracuda.png',source:'Fishing (requires 350 FP)'},
  fish_anglerfish:{sl:'fish_anglerfish',grp:'fish',name:'Anglerfish',val:300,e:'🐡',r:3,img:'fish/fish_anglerfish.png',source:'Fishing (requires 440 FP)'},
  fish_shark:{sl:'fish_shark',grp:'fish',name:'Shark',val:500,e:'🦈',r:3,img:'fish/fish_shark.png',source:'Fishing (requires 550 FP)'},
  fish_leviathan:{sl:'fish_leviathan',grp:'fish',name:'Leviathan',val:1000,e:'🐉',r:4,img:'fish/fish_leviathan.png',source:'Fishing (requires 655 FP)'},
  // Łuska suma – materiał (rare) do craftingu kompletu Seasoned Angler (3 łuski + część Angler); 2% z każdego złowionego Suma (wielokrotnie)
  catfish_scale:{sl:'catfish_scale',grp:'fish',name:'Catfish Scale',val:50,e:'🔷',r:2,img:'materials/catfish_scale.png',source:'Fishing (Catfish)',desc:"Crafting material (Seasoned Angler gear)"},
  // Kieł barrakudy – materiał (rare); 2% z każdej złowionej Barrakudy (wielokrotnie, łączy się w stos, jak Łuska suma). Zastosowanie: do ustalenia
  barracuda_fang:{sl:'barracuda_fang',grp:'fish',name:'Barracuda Fang',val:75,e:'🦷',r:2,img:'materials/barracuda_fang.png',source:'Fishing (Barracuda)'},
  // Światło żabnicy – materiał (epic) do craftingu kompletu Sea Raider (3 sztuki + część Seasoned Angler); 3% z każdej złowionej Żabnicy (wielokrotnie)
  light_of_anglerfish:{sl:'light_of_anglerfish',grp:'fish',name:'Light of Anglerfish',val:150,e:'💡',r:3,img:'materials/light_of_anglerfish.png',source:'Fishing (Anglerfish)',desc:'Crafting material (Sea Raider gear)'},
  // Płetwa rekina – materiał (epic) do ulepszania wędki i haczyka z rare (niebieskie) na epic (fioletowe); 5% z każdego złowionego Rekina (wielokrotnie, łączy się w stos)
  // Perła głębin – materiał (legendary); 5% z każdego złowionego Lewiatana (wielokrotnie, łączy się w stos). Ulepszenie wędki i haczyka epic → legendary (10 sztuk)
  pearl_of_the_deep:{sl:'pearl_of_the_deep',grp:'fish',name:'Pearl of the Deep',val:400,e:'🦪',r:4,img:'materials/pearl_of_the_deep.png',source:'Fishing (Leviathan)',desc:'Rod and hook upgrade material (purple → gold)'},
  shark_fin:{sl:'shark_fin',grp:'fish',name:'Shark Fin',val:250,e:'🦈',r:3,img:'materials/shark_fin.png',source:'Fishing (Shark)',desc:'Rod and hook upgrade material (blue → purple)'}
};

// Ryby do wyboru w łowieniu. fp = wymagane FP (suma FP z ekwipunku rybackiego na stronie 2), żeby łowić tę rybę.
// Każde branie = 100% sukcesu (nie ma już szansy wyłowienia ani poziomu łowienia). DEV: każdą rybę można łowić bez względu na FP.
// Crucian Carp: 20 FP – wystarczy sama szara wędka (Stick and String ma 25 FP).
// PROGI FP (wygładzone): wymaganie ≈ 85% najlepszego gearu do zdobycia na rybach PONIŻEJ (bez Uncommon Ring / Amulet – usunięte z gry).
// Gear przed rybą → próg: start 25 → Carp 20 | 100 → Cod 85 | 200 → Catfish 170 | 415 → Barracuda 350 | 520 → Anglerfish 440 | 645 → Shark 550 | 770 → Leviathan 655 (z Shark Eye Trophy).
// Drzewko (+150 FP) i Fishpedia (+70 FP) nie są potrzebne do wejścia na rybę – dają nadwyżkę (mnożnik FP).
// t = [min, max] s – bazowy czas brania (losowany co do sekundy); im lepsza ryba, tym dłużej.
// Średnio: Carp 15 s, Cod 17 s, Catfish 20 s, Barracuda 23 s, Anglerfish 25 s, Shark 27 s, Leviathan 30 s.
// dr = mnożnik szans na WSZYSTKIE dropy tej ryby (special dropy i materiały; brak = 1). Dobrany symulacją tak, żeby czas
// łowienia danej ryby do odblokowania następnej wynosił średnio: Carp ~5 min (20 karpi na ulepszenia), Cod 1 h, Catfish 3 h,
// Barracuda 5 h, Anglerfish 8 h, Shark 15 h, Leviathan 24 h (do Legendary Rod i Legendary Hook – 20 Pearl of the Deep). Razem ~55 h.
export const FISH=[
  {id:'fish_carp',name:'Crucian Carp',e:'🐟',fp:20,t:[7,14]},
  {id:'fish_cod',name:'Cod',e:'🐠',fp:85,t:[8,15],dr:0.25},
  {id:'fish_catfish',name:'Catfish',e:'🐟',fp:170,t:[11,18],dr:0.5},
  {id:'fish_barracuda',name:'Barracuda',e:'🐟',fp:350,t:[13,20],dr:1.25},
  {id:'fish_anglerfish',name:'Anglerfish',e:'🐡',fp:440,t:[14,21],dr:0.3},
  {id:'fish_shark',name:'Shark',e:'🦈',fp:550,t:[15,22],dr:0.13},
  {id:'fish_leviathan',name:'Leviathan',e:'🐉',fp:655,t:[18,25],dr:0.2}
];
// Placeholdery kolejnych ryb – wymagane FP (na razie nieklikalne). Pusto: wszystkie ryby są w FISH.
export const FISH_LOCKED=[];

const M_=(n,e,l,drop)=>({n,e,l,drop});
const DP=w=>w.length==1?[0]:w.flatMap((n,r)=>Array(n).fill(r));
const D1=DP([100]),D2=DP([70,30]),D3=DP([50,30,20]),D4=DP([50,30,20,10]);

// DROPY (rzadkość przedmiotu po walce; procenty widać w oknie ℹ️ przeciwnika):
//   Akt 1 (~30 poz.): Forest – tylko szare; od Skeletona zielone 20% → 60% (Fire Lord), reszta szare; Fire Lord dodatkowo 15% niebieskie
//   Akt 2 (~60 poz.): 70% zielone / 30% niebieskie; Abyss Lord (boss 2.5) – 35% zielone / 50% niebieskie / 15% fioletowe
//   Akt 3 (80 poz.):  70% niebieskie / 30% fioletowe; Chaos Emperor (boss 3.5) – 35% niebieskie / 50% fioletowe / 15% złote
const DFL=DP([35,50,15]);
const DA2=DP([0,70,30]), DA2B=DP([0,35,50,15]), DA3=DP([0,0,70,30]), DA3B=DP([0,0,35,50,15]);
export const LOCS=[
{n:'Forest',e:'🌲',mobs:[M_('Lynx','🐆',1,D1),M_('Boar','🐗',2,D1),M_('Deer','🦌',3,D1),M_('Wolf','🐺',4,D1),M_('Bear','🐻',5,D1)]},
{n:'Graveyard',e:'⚰️',mobs:[M_('Skeleton','💀',6,D2),M_('Skeleton Warrior','⚔️',7,D2),M_('Skeleton Mage','🧙',8,D2),M_('Ghoul','🧟',9,D2),M_('Necromancer','☠️',10,D2)]},
{n:'Tundra',e:'❄️',mobs:[M_('Polar Bear','🐻',11,D2),M_('Snow Worm','🐛',12,D2),M_('Mammoth','🐘',13,D2),M_('Lantern Keeper','🏮',14,D2),M_('Ice Dragon','🐉',15,D2)]},
{n:'Desert',e:'🏜️',mobs:[M_('Scorpion','🦂',16,D2),M_('Cobra','🐍',17,D2),M_('Vulture','🦅',18,D2),M_('Tomb Guardian','🏺',19,D2),M_('Sphinx','🦁',20,D2)]},
{n:'Volcano',e:'🌋',mobs:[M_('Salamander','🦎',21,D2),M_('Imp','😈',22,D2),M_('Lava Golem','🗿',23,D2),M_('Fire Demon','👹',24,D2),M_('Fire Lord','🔥',25,DFL)]}];

// AKT 1: Forest – tylko szare. Od Skeletona szansa na ZIELONY rośnie z każdym kolejnym przeciwnikiem – od 20% do 60% (Fire Lord), liniowo.
// Reszta to szare; Fire Lord dodatkowo 15% na niebieski (25% szare / 60% zielone / 15% niebieskie).
LOCS.slice(1).flatMap(l => l.mobs).forEach((m, i, all) => {
  const g = Math.round(20 + 40 * i / (all.length - 1)), last = i === all.length - 1;
  m.drop = last ? DP([100 - g - 15, g, 15]) : DP([100 - g, g]);
});

// POZIOMY PRZECIWNIKÓW (widoczne w prawym górnym rogu kafelka): Akt 1: 1 → 30 (Fire Lord), Akt 2: 31 → 60 (Abyss Lord), Akt 3: 61 → 80 (Chaos Emperor).
// Akt 1: statystyki zostają liczone od DAWNEGO poziomu (sl = 1…25), żeby nie zmieniać balansu walki; nowy poziom (l) liczy się do XP, złota i pancerza.
LOCS.flatMap(l => l.mobs).forEach((m, i, all) => { m.sl = m.l; m.l = Math.round(1 + 29 * i / (all.length - 1)); });

// GRAFIKI PRZECIWNIKÓW (assets/enemies/, pixel art 32×32): ładowane automatycznie z nazwy – enemy_<nazwa>.png
// (małe litery, spacje → _, np. Falcon → enemy_falcon.png, Ice Dragon → enemy_ice_dragon.png); brak pliku → emoji. Patrz mobIco w ui.js.

LOCS.forEach(l => l.mobs.forEach(m => {
  m.mats = [];
  if(l.n === 'Forest') {
    m.mats = [['meat', 0.4]];
    if(m.n === 'Bear') {
      m.mats.push(['claw', 0.25]);
    }
  }
  // Cmentarz: kości ze szkieletów i Ghoula (50% szansy), czaszka z Nekromanty (30% szansy)
  if(l.n === 'Graveyard' && ['Skeleton','Skeleton Warrior','Skeleton Mage','Ghoul'].includes(m.n)) {
    m.mats = [['bone', 0.5]];
  }
  if(l.n === 'Graveyard' && m.n === 'Necromancer') {
    m.mats = [['skull', 0.3]];
  }
}));

// AKTY 2 i 3 – przeciwnicy ze stałymi statystykami (st), skalowani od Fire Lorda (ostatni boss Aktu 1) do ostatniego przeciwnika Aktu 3.
// k = 1…50 = kolejny przeciwnik po Fire Lordzie; poziom = 30 + k (Akt 2: 31–55, Akt 3: 56–80; cel gracza: ~60 i ~80 poziom).
//   HP:        2354 → 100 000 (×42.5, czyli ×1.078 na przeciwnika)
//   obrażenia: Fire Lord 217–325 → ×4.2 na końcu Aktu 3
//   pancerz:   161 → ×4,   Dexterity: 171 → ×3,   crit: 5% → 15%
// Bez materiałów; dropy przedmiotów – patrz DA2 / DA3 niżej.
const FL0={hp:2354,min:217,max:325,arm:161,dex:171};
let kMob=0;
const MX=(n,e)=>{ kMob++; const t=kMob/50;
  return { n, e, l:30+kMob, drop:[], mats:[], st:{ hp:Math.round(FL0.hp*(100000/FL0.hp)**t), min:FL0.min*4.2**t, max:FL0.max*4.2**t, arm:FL0.arm*4**t, dex:FL0.dex*3**t, crit:Math.round(5+10*t) } }; };
export const LOCS2=[
{n:'Swamp',e:'🐊',mobs:[MX('Giant Frog','🐸'),MX('Bog Lurker','🦎'),MX('Crocodile','🐊'),MX('Swamp Witch','🧙'),MX('Hydra','🐲')]},
{n:'Dark Forest',e:'🌑',mobs:[MX('Giant Spider','🕷️'),MX('Werewolf','🐺'),MX('Dark Elf','🧝'),MX('Treant','🌳'),MX('Spider Queen','🕸️')]},
{n:'Mountain Pass',e:'⛰️',mobs:[MX('Harpy','🦅'),MX('Troll','👹'),MX('Rock Giant','🗿'),MX('Griffin','🦁'),MX('Stone Titan','🏔️')]},
{n:'Haunted Castle',e:'🏰',mobs:[MX('Ghost Knight','👻'),MX('Banshee','😱'),MX('Cursed Armor','🛡️'),MX('Vampire Bat','🦇'),MX('Vampire Lord','🧛')]},
{n:'Abyssal Rift',e:'🌀',mobs:[MX('Shadow Hound','🐕'),MX('Void Stalker','👁️'),MX('Abyss Knight','⚔️'),MX('Demon Priest','😈'),MX('Abyss Lord','👿')]}];
export const LOCS3=[
{n:'Frozen Peaks',e:'🏔️',mobs:[MX('Frost Giant','🧊'),MX('Ice Wraith','👻'),MX('Yeti','🦍'),MX('Frost Wyvern','🐉'),MX('Ice Queen','👸')]},
{n:'Sunken City',e:'🌊',mobs:[MX('Merfolk Warrior','🔱'),MX('Giant Crab','🦀'),MX('Siren','🧜'),MX('Sea Serpent','🐍'),MX('Kraken','🦑')]},
{n:'Storm Isles',e:'⛈️',mobs:[MX('Storm Elemental','⚡'),MX('Thunderbird','🦅'),MX('Cyclops','👁️'),MX('Storm Giant','🌩️'),MX('Storm Lord','🌪️')]},
{n:'Dragon Lair',e:'🐲',mobs:[MX('Drake','🦎'),MX('Wyvern','🐉'),MX('Dragon Knight','🛡️'),MX('Elder Drake','🔥'),MX('Ancient Dragon','🐲')]},
{n:'Throne of Chaos',e:'👑',mobs:[MX('Chaos Spawn','🌀'),MX('Fallen Angel','😇'),MX('Chaos Knight','⚔️'),MX('Archdemon','👹'),MX('Chaos Emperor','👑')]}];

// AKTY: menu aktów pokazuje się po pierwszym pokonaniu Fire Lorda. Lokacje wszystkich aktów mają WSPÓLNY indeks (ALL_LOCS):
// Akt 1 = 0–4, Akt 2 = 5–9, Akt 3 = 10–14. Pokonanie bossa lokacji odblokowuje następną, także w kolejnym akcie.
// dropy Aktów 2 i 3: zwykli przeciwnicy i bossowie lokacji – DA2 / DA3, ostatni boss aktu – DA2B / DA3B
LOCS2.forEach(l => l.mobs.forEach(m => { m.drop = DA2; })); LOCS2[4].mobs[4].drop = DA2B;
// poziomy Aktów 2 i 3 (statystyki są stałe w st, więc poziom ich nie zmienia)
LOCS2.flatMap(l => l.mobs).forEach((m, i, all) => { m.l = Math.round(31 + 29 * i / (all.length - 1)); });
LOCS3.flatMap(l => l.mobs).forEach((m, i, all) => { m.l = Math.round(61 + 19 * i / (all.length - 1)); });
LOCS3.forEach(l => l.mobs.forEach(m => { m.drop = DA3; })); LOCS3[4].mobs[4].drop = DA3B;
export const ACTS=[
  {n:'Act 1',e:'⚔️',locs:LOCS},
  {n:'Act 2',e:'🏰',locs:LOCS2},
  {n:'Act 3',e:'🐲',locs:LOCS3}
];
export const ALL_LOCS=[...LOCS,...LOCS2,...LOCS3];
// WYPRAWA: wszyscy przeciwnicy wszystkich aktów mają 10% mniej HP (hpMul; lochy bez zmian)
ALL_LOCS.forEach(l => l.mobs.forEach(m => { m.hpMul = 0.9; }));
export const ACT_START=[0,LOCS.length,LOCS.length+LOCS2.length];

export const allMobsFlat = [];
LOCS.forEach(l => l.mobs.forEach(m => allMobsFlat.push(m)));

// LOCH (Akt 1): dropy jak w Akcie 1 – 25% białe / 60% zielone / 15% niebieskie (było: fioletowe i złote)
// LOCH „Spider's Den” (dawniej Crypt of the Forgotten): 3 przeciwników – Spiderling, Spider Servant, Spider Queen (dawniej Crypt Guardian, Wraith, Bone Knight).
// Grafiki: enemies/enemy_spiderling.png, enemy_spider_servant.png, enemy_spider_queen.png (ładowane automatycznie z nazwy, brak pliku → emoji). Bez losowych przedmiotów (drop:[]) – tylko special dropy. sd = special dropy przeciwnika (stałe przedmioty z FIXED_ITEMS, pct = szansa w %)
const DUN_SD={ 'Spiderling':[{k:'forgotten_edge',pct:10},{k:'forgotten_cuirass',pct:5},{k:'forgotten_pendant',pct:3},{k:'forgotten_aegis',pct:8},{k:'forgotten_fang',pct:2}],
  // Spider Servant: zestaw Chitin (rare) – Carapace 7%, Boots 5%, Charm 8%; Chitin Halberd (poza setem) 6%; nadal maks. 1 special drop na walkę
  'Spider Servant':[{k:'chitin_carapace',pct:7},{k:'silkstep_boots',pct:5},{k:'spider_eye_charm',pct:8},{k:'chitin_halberd',pct:6}],
  // Spider Queen (26 poziom): zestaw Widow (rare) – Spear 9%, Ring 8%, Gauntlets 15%, Helm 5%; Widows Heart (epic, osobna nagroda) 0.4%; nadal maks. 1 special drop na walkę
  'Spider Queen':[{k:'widow_spear',pct:9},{k:'widow_ring',pct:8},{k:'widowgrip_gauntlets',pct:15},{k:'widow_helm',pct:5},{k:'widows_heart',pct:0.4}] };
export const DUN={n:"Spider's Den",e:'🕸️',mobs:['Spiderling','Spider Servant','Spider Queen'].map((n,i)=>{const f=1.3**i;return{n,sd:DUN_SD[n]||[],e:['🕷️','🕷️','👑'][i],l:[13,20,26][i],drop:[],st:{hp:Math.round(1500*f),min:72*f,max:108*f,arm:(80+i*12)/2,crit:5,dex:30+i*5}}})};
// Spiderling (dawniej Crypt Guardian): na bazie Skeleton Mage (23 pancerza, 9.5% uniku, 27 Dexterity) – 820 HP (było 610), 30–42 obrażeń
// OPISY (lore) przeciwników lochu – widoczne pod special dropami (4 zdania, ostatnie o bohaterze)
DUN.mobs[0].lore = 'Of all the eggs laid deep in the den, only this one hatched. It grew alone in the dark, small, quick and always hungry, feeding on whatever wandered too far from the light. Many adventurers came here looking for treasure, and their swords and armor still hang in its web. Now you step into the dark, and it is already watching you.';
DUN.mobs[1].lore = 'Long ago, a knight came down into the den to slay the Queen, and he never came back up. Her venom did not kill him, it changed him piece by piece until nothing human was left but his loyalty. Now he guards the same tunnels he once fought through, wrapping every intruder in silk for his new mistress. You walk the path he walked, and you must make sure it does not end the same way.';
DUN.mobs[2].lore = 'Before the den was filled with webs, it was a temple, and she was its high priestess. When the kingdom above fell, she refused to die with it and gave herself to the spiders living in the walls. Over the centuries they made her their mother and their queen, and the temple became her nest. Every step you take in her den trembles along her web, and she has been waiting for you for a very long time.';
// Spider Servant: −300 HP (widoczne w walce: 2321 → 2021; bazowe 1950 → 1698, bo HP w walce = bazowe × 1.19) i obrażenia −3 / −3 (93.6–140.4 → 90.6–137.4)
DUN.mobs[1].st.hp = 1698; DUN.mobs[1].st.min -= 3; DUN.mobs[1].st.max -= 3;
DUN.mobs[0].st = { hp: 820, min: 30, max: 42, arm: 23, crit: 5, dodge: 9.5, dex: 27 };

// IKONY SKILLI: grafiki z assets/skills (pixel art 16×16, plik 64×64). f = nazwa pliku bez .png, e = emoji zapasowe, px = rozmiar.
// Małe nody (statystyki): plusy – zielony Dexterity, żółty Strength, czerwony Vitality – 16 px (×1), środek: 32 px (×2) – zawsze całkowita skala, więc piksele są ostre.
// Gdy pliku nie ma, w jego miejscu pojawia się emoji (jak wcześniej).
// display:block – obrazek nie siedzi na linii bazowej tekstu, więc jest dokładnie na środku kwadratu noda.
const SKI = (f, e, px) => `<img src="assets/skills/${f}.png" alt="" style="display:block;width:${px}px;height:${px}px;image-rendering:pixelated" onerror="this.outerHTML='${e}'">`;
export const SKILL_ICON_CENTER = SKI('skill_surprise', '⚡', 32);   // środkowy skill "Surprise Attack"
// Ikony klątw (styl WoW, 128×128) z assets/skills/curses – w dużym nodzie 40 px, skalowane gładko (to nie pixel art)
// Gdy pliku nie ma w assets/skills/curses/, szuka dalej w assets/skills/, assets/curses/ i assets/ – dopiero potem pokazuje emoji.
const CUR_DIRS = ['assets/skills/curses/', 'assets/skills/', 'assets/curses/', 'assets/'];
const CUR = (f, e) => `<img src="${CUR_DIRS[0]}${f}.png" alt="" data-n="0" style="display:block;width:40px;height:40px;border-radius:6px" onerror="const d=${JSON.stringify(CUR_DIRS).replace(/"/g, "'")},n=+this.dataset.n+1;this.dataset.n=n;if(d[n])this.src=d[n]+'${f}.png';else this.outerHTML='${e}'">`;

// ===== DRZEWKO KLĄTW (CURSES) – prawy górny róg =====
// Układ: pień po przekątnej (45°) → rozwidlenie → 3 równoległe, poziome tory (y = -345 / -225 / -105).
// Plusy co 60 px; duże skille każdego toru w tych samych kolumnach (x = 520 i x = 810); finał na końcu środkowego toru.
// Środek → 3 czerwone plusy → Curse of Frailty → 3 ścieżki (każda: 3 plusy → duży skill → 3 plusy → duży skill)
// → Death Sentence (wymaga 2 z 3 końcówek). Ścieżki widać dopiero po kupieniu Curse of Frailty (vis: 'fr').
// Każdy node kosztuje 1 skill point. Efekty (eff) liczy ub() w state.js, walka w ui.js / combat.js.
const PLUS = { str: ['skill_plus_str', 'Strength', '⚔️'], dex: ['skill_plus_dex', 'Dexterity', '💨'], con: ['skill_plus_vit', 'Vitality', '❤️'] };
// 3 małe nody ze statystyką (+3) po kolei: p = prefiks id, from = poprzedni node, pts = pozycje
const plus3 = (p, from, st, pts, vis) => pts.map(([x, y], i) => ({
  id: p + (i + 1), from: i ? p + i : from, req: i ? p + i : from, vis, x, y, k: 's',
  ic: SKI(PLUS[st][0], PLUS[st][2], 16), n: 'Lesser ' + PLUS[st][1], d: '+3 ' + PLUS[st][1], eff: { [st]: 3 }   // nazwa: Lesser Strength / Lesser Dexterity / Lesser Vitality
}));
// pojedynczy mały node ze statystyką (+3) – do ścieżek, gdzie ID nadajemy ręcznie
const plus1 = (id, from, x, y, st, vis) => ({ id, from, req: from, vis, x, y, k: 's', ic: SKI(PLUS[st][0], PLUS[st][2], 16), n: 'Lesser ' + PLUS[st][1], d: '+3 ' + PLUS[st][1], eff: { [st]: 3 } });
// RANGI: duże nody mają max = 3 rangi (Terror 1). eff = efekt JEDNEJ rangi (sumuje się: ranga × eff).
// d = opis; może być funkcją rangi r (tooltip pokazuje obecną i następną rangę).
// Kolejny node można kupić dopiero, gdy poprzedni jest wymaksowany (np. Withering 3/3 → Terror).
const v = x => +x.toFixed(2);   // ładne liczby w opisach: 1.67, 0.33, 6.67
const big = (id, from, x, y, ic, n, d, eff, vis = 'fr', max = 3) => ({ id, from, req: from, vis, x, y, k: 'b', ic, n, d, eff, max });
const SOON = 'No effect yet (coming soon)';
// debuff: 1 = skill nakłada debuff na wroga – w dymku w zakładce Skills pojawia się etykieta "Debuff" (prawy górny róg)
// buff: 1 = skill daje buff graczowi – etykieta "Buff" (zielona) w tym samym miejscu
// SUNDER: zmniejszenie pancerza za cios na randze r = 1% / 3% / 5% (2r-1), maks. 3 stosy (3% / 9% / 15%).
// EXPOSED WEAKNESS (1/1) podnosi limit Sundera do 30% – czyli 6 stosów po 5%.
const sunderPer = r => 2 * r - 1;

export const UPG = [
  ...plus3('v', 'center', 'con', [[55, -55], [110, -110], [165, -165]]),
  big('fr', 'v3', 235, -225, CUR('curse_frailty', '💜'), 'Shatter', r => `Enemies start combat with ${v(100 - 8 / 3 * r)}% of their health`, { efrail: 8 / 3 }, null),   // −2.67% / 5.33% / 8% HP wroga (było do 5%)   // null = widoczny od razu (undefined wziąłby domyślne 'fr')
  // NAZWY W GRZE: fr = Shatter, su = Curse of Frailty, cr = Curse of Withering, la = Curse of the Void (w kodzie zostają stare id i klucze)
  // górna ścieżka (małe nody: Vitality): Curse of Frailty (su) → Exposed Weakness → Shadow Prayers
  ...plus3('s', 'fr', 'con', [[315, -345], [375, -345], [435, -345]], 'fr'),
  { ...big('su', 's3', 520, -345, CUR('curse_sunder', '🛡️'), 'Curse of Frailty', r => `Each of your hits removes ${sunderPer(r)}% of enemy armor (max ${3 * sunderPer(r)}%)`, { sunder: 1 }), debuff: 1 },   // U.sunder = ranga
  ...plus3('s', 'su', 'con', [[605, -345], [665, -345], [725, -345]], 'fr').map((n, i) => Object.assign(n, { id: 's' + (i + 4), from: i ? 's' + (i + 3) : 'su', req: i ? 's' + (i + 3) : 'su' })),
  big('ex', 's6', 810, -345, CUR('curse_exposed', '👁️'), 'Exposed Weakness', 'If the enemy has at least 2 curses active, you deal 15% more damage to it', { expose: 15 }, 'fr', 1),   // 1/1: +15% obrażeń, gdy na wrogu są min. 2 klątwy (dawniej: limit Curse of Frailty 15% → 30%)
  // środkowa ścieżka (małe nody: Strength): Withering → Terror → Death Sentence
  ...plus3('c', 'fr', 'str', [[315, -225], [375, -225], [435, -225]], 'fr'),
  { ...big('cr', 'c3', 520, -225, CUR('curse_cripple', '⛓️'), 'Curse of Withering', r => `Enemy loses ${v(r / 3)}% of its current Strength after each of its attacks`, { exhaust: 1 / 3 }), debuff: 1 },
  ...plus3('c', 'cr', 'str', [[605, -225], [665, -225], [725, -225]], 'fr').map((n, i) => Object.assign(n, { id: 'c' + (i + 4), from: i ? 'c' + (i + 3) : 'cr', req: i ? 'c' + (i + 3) : 'cr' })),
  { ...big('te', 'c6', 810, -225, CUR('curse_terror', '😱'), 'Terror', 'You gain the Strength drained by Curse of Withering', { reap: 1 }, 'fr', 1), buff: 1 },
  // dolna ścieżka (małe nody: Dexterity): Curse of the Void → Soul Sunder → Unholy Grace
  ...plus3('b', 'fr', 'dex', [[315, -105], [375, -105], [435, -105]], 'fr'),
  // Curse of the Void: każdy Twój cios +r% szansy na krytyk przeciw wrogowi, maks. 5 stosów (5% / 10% / 15%); może przekroczyć limit 50%
  { ...big('la', 'b3', 520, -105, CUR('curse_shadow_mark', '🔮'), 'Curse of the Void', r => `Each of your hits increases your critical hit chance against the enemy by ${r}% (max ${5 * r}%). Can exceed the 50% cap`, { mark: 1 }), debuff: 1 },   // U.mark = ranga
  ...plus3('b', 'la', 'dex', [[605, -105], [665, -105], [725, -105]], 'fr').map((n, i) => Object.assign(n, { id: 'b' + (i + 4), from: i ? 'b' + (i + 3) : 'la', req: i ? 'b' + (i + 3) : 'la' })),
  big('fe', 'b6', 810, -105, CUR('curse_soul_rend', '💀'), 'Soul Sunder', 'Your critical hits ignore 50% of enemy armor', { rend: 1 }, 'fr', 1),   // 1/1
  // finał środkowej ścieżki: Death Sentence za Terror (wymaga Terror 1/1)
  { id: 'ds', from: 'te', req: 'te', vis: 'fr', x: 925, y: -225, k: 'b', ic: CUR('curse_death', '⏳'), n: 'Death Sentence', d: r => `Hits on enemies below 20% health have a ${v(20 / 3 * r)}% chance to kill`, eff: { doom: 20 / 3 }, max: 3 },
  // finał górnej ścieżki: Shadow Prayers za Exposed Weakness (wymaga Exposed Weakness 1/1) – +20% maks. HP przy 3/3
  { id: 'shp', from: 'ex', req: 'ex', vis: 'fr', x: 925, y: -345, k: 'b', ic: CUR('curse_shadow_prayers', '🙏'), n: 'Shadow Prayers', d: r => `Increases your maximum health by ${v(20 / 3 * r)}%`, eff: { hpPct: 20 / 3 }, max: 3 },
  // finał dolnej ścieżki: Unholy Grace za Soul Sunder (wymaga Soul Sunder 1/1) – +20% Dexterity przy 3/3
  { id: 'ug', from: 'fe', req: 'fe', vis: 'fr', x: 925, y: -105, k: 'b', ic: CUR('curse_unholy_grace', '🗡️'), n: 'Unholy Grace', d: r => `Increases your Dexterity by ${v(20 / 3 * r)}%`, eff: { dexPct: 20 / 3 }, max: 3 },
  // AGONY: łączy wszystkie 3 ścieżki – wymaga wymaksowania Shadow Prayers, Death Sentence i Unholy Grace (reqAny + reqN: 3).
  // Linie od wszystkich trzech finałów (from + fromX). Za każdą klątwę na wrogu −10% jego statystyk (liczone w walce, ui.js).
  { id: 'ag', from: 'ds', fromX: ['shp', 'ug'], reqAny: ['shp', 'ds', 'ug'], reqN: 3, vis: 'fr', x: 1055, y: -225, k: 'b', ic: CUR('curse_agony', '🌑'), n: 'Torment', d: 'For every curse on the enemy, its stats are lowered by 10%', eff: { agony: 1 }, max: 1 },

  // ===== NOWA ODNOGA – prawy dolny róg (lustro drzewka klątw: te same kolumny, y dodatnie) =====
  // Środek → 3 plusy Vitality (po przekątnej w prawy dół) → Determination → 3 ścieżki (y = 105 / 225 / 345) → finały → node łączący.
  // Ścieżki widać dopiero po kupieniu Determination (vis: 'dt'). Wszystko za Determination to na razie placeholdery (ph: 🔒).
  ...plus3('w', 'center', 'con', [[55, 55], [110, 110], [165, 165]]),
  big('dt', 'w3', 235, 225, CUR('skill_determination', '🔥'), 'Determination', r => `Your first attack in combat deals ${10 * r}% more damage`, { firstDmg: 10 }, null),   // +10% za rangę (30% przy 3/3)
  // ścieżka d0 (y = 105, małe nody: Dexterity): Cruelty → Rage Within → Bloodlust
  ...[315, 375, 435].map((x, i) => plus1('d0_' + i, i ? 'd0_' + (i - 1) : 'dt', x, 105, 'dex', 'dt')),
  big('d0_3', 'd0_2', 520, 105, CUR('skill_cruelty', '🗡️'), 'Cruelty', r => `Dexterity counts ${v(r * 25 / 3)}% more toward critical hit chance`, { critEff: 1 / 30 }, 'dt'),   // 0.5% przy 3/3
  ...[605, 665, 725].map((x, i) => plus1('d0_' + (i + 4), 'd0_' + (i + 3), x, 105, 'dex', 'dt')),
  // RAGE WITHIN (3 rangi): każdy Twój krytyk +1% / 2% / 3% obrażeń broni do końca walki, maks. +30% (30 / 15 / 10 stosów); dawniej: +3% limitu krytyka (1/1)
  { ...big('d0_7', 'd0_6', 810, 105, CUR('skill_rage_within', '😤'), 'Rage Within', r => `Every critical hit increases your average weapon damage by ${r}% for the rest of the combat (max 30%)`, { rage: 1 }, 'dt'), buff: 1 },
  big('d0_8', 'd0_7', 925, 105, CUR('skill_bloodlust', '🩸'), 'Bloodlust', r => `Your critical hits deal ${10 * r}% more damage`, { critBonus: 10 }, 'dt'),   // +10% za rangę (przeniesione ze ścieżki d1)
  // środkowa ścieżka d1 (y = 225, małe nody: Strength): Brutal Force → War Cry → Battle Fervor
  ...[315, 375, 435].map((x, i) => plus1('d1_' + i, i ? 'd1_' + (i - 1) : 'dt', x, 225, 'str', 'dt')),
  big('d1_3', 'd1_2', 520, 225, CUR('skill_brutal_force', '💪'), 'Brutal Force', r => `Each point of Strength gives +${v(1 + r / 30)}% weapon damage instead of +1%`, { strEff: 1 / 30 }, 'dt'),   // +0.1 przy 3/3
  ...[605, 665, 725].map((x, i) => plus1('d1_' + (i + 4), 'd1_' + (i + 3), x, 225, 'str', 'dt')),
  { ...big('d1_7', 'd1_6', 810, 225, CUR('skill_war_cry', '📯'), 'War Cry', 'Your first 4 attacks in combat deal 15% more damage', { warcry: 1 }, 'dt', 1), buff: 1 },   // 1/1: +15% obrażeń przez 4 pierwsze ataki
  { ...big('d1_8', 'd1_7', 925, 225, CUR('skill_battle_fervor', '🔥'), 'Battle Fervor', r => `Each of your strikes increases your damage by ${r}% (max ${5 * r}%) for the rest of the combat`, { fervor: 1 }, 'dt'), buff: 1 },   // 1% / 2% / 3% za cios, maks. 5 stosów
  // ścieżka d2 (y = 345, małe nody: Vitality): Headstrong → Thick Skin → Iron Will
  ...[315, 375, 435].map((x, i) => plus1('d2_' + i, i ? 'd2_' + (i - 1) : 'dt', x, 345, 'con', 'dt')),
  big('d2_3', 'd2_2', 520, 345, CUR('skill_headstrong', '🐂'), 'Headstrong', r => `Each point of Vitality gives ${v(4 + r / 3)} health instead of 4`, { vitEff: 1 / 3 }, 'dt'),   // 5 HP przy 3/3
  ...[605, 665, 725].map((x, i) => plus1('d2_' + (i + 4), 'd2_' + (i + 3), x, 345, 'con', 'dt')),
  big('d2_7', 'd2_6', 810, 345, CUR('skill_thick_skin', '🪨'), 'Thick Skin', 'Increases armor gained from items by 10%', { armPct: 10 }, 'dt', 1),   // 1/1
  big('d2_8', 'd2_7', 925, 345, CUR('skill_iron_will', '⚜️'), 'Iron Will', r => `Increases your maximum health by ${v(20 / 3 * r)}%`, { hpPct: 20 / 3 }, 'dt'),   // +20% przy 3/3 (sumuje się z Shadow Prayers)
  // ENDURE (finał, jak Torment): linie od trzech finałów; wymaga wymaksowania wszystkich trzech (Bloodlust, Battle Fervor, Iron Will)
  { id: 'dj', from: 'd1_8', fromX: ['d0_8', 'd2_8'], reqAny: ['d0_8', 'd1_8', 'd2_8'], reqN: 3, vis: 'dt', x: 1055, y: 225, k: 'b', ic: CUR('skill_endure', '💖'), n: 'Endure', d: 'The first time your health reaches zero in combat, you revive with 30% of your maximum health (once per combat)', eff: { endure: 1 }, max: 1 },

  // ===== NOWA ODNOGA – lewy dolny róg (mag) =====
  // NAZWY W GRZE: l0_3 = Lightning Incantation (dawniej Lightning Bolt), l1_3 = Fire Incantation (Combustion), l2_3 = Water Incantation (Tidal Renewal)
  // Gotowe: 3 plusy Vitality po przekątnej (lw1–lw3) → Elemental Barrier (lr) → górna ścieżka: 3 plusy Vitality → Lightning Incantation (l0_3)
  // → 3 plusy Vitality → Overcharge (l0_7) → Life Essence (l0_8, +20% maks. HP przy 3/3).
  // IKONY gałęzi maga: assets/skills/curses/skill_*.png (Elemental Barrier – jasny fiolet, ścieżka Lightning – żółto-pomarańczowa,
  // Fire – czerwono-pomarańczowa, Water – niebiesko-zielona, Master of All Elements – wir wszystkich żywiołów).
  // Środkowa ścieżka (l1, małe nody Dexterity): Combustion (l1_3) → Lingering Flames (l1_7, 1/1) → Blazing Reflexes (l1_8, +20% Dexterity).
  // Dolna ścieżka (l2, małe nody Strength): Tidal Renewal (l2_3) → Soothing Tide (l2_7, 1/1) → Mist Veil (l2_8, −9% krytyka wroga).
  // Finał lj: Master of All Elements (1/1) – wymaga wymaksowania Life Essence, Blazing Reflexes i Mist Veil; Incantations potrzebują 4 stosów zamiast 5.
  // Reszta gałęzi to na razie placeholdery 🔒.
  // Ten sam kształt co prawa dolna odnoga (Determination), odbity w lewo (x ujemne): środek → 3 małe nody po przekątnej w lewy dół →
  // duży node (lr) → 3 ścieżki (y = 105 / 225 / 345: 3 małe, duży, 3 małe, duży, duży) → node łączący (lj) z liniami od trzech finałów.
  // Wszystko ph: 1 (nie do kupienia, dymek „Locked”), widoczne od razu (vis: null), żeby było widać kształt gałęzi.
  // ID: lw1–lw3 (przekątna), lr (pierwszy duży), l0_0…l0_8 / l1_0…l1_8 / l2_0…l2_8 (ścieżki), lj (finał).
  ...(() => {
    const ph = (id, from, x, y, k, fromX) => ({ id, from, ...(fromX ? { fromX } : {}), req: from, vis: null, x, y, k, ph: 1, n: 'Locked', d: SOON, eff: {}, max: k === 'b' ? 3 : 1 });
    const a = [
      ...plus3('lw', 'center', 'con', [[-55, 55], [-110, 110], [-165, 165]]),   // Lesser Vitality ×3 (lw1–lw3)
      // ELEMENTAL BARRIER: na starcie walki tarcza = 1.67% / 3.33% / 5% maks. HP (było do 10%); pochłania obrażenia, zanim spadnie zdrowie
      { ...big('lr', 'lw3', -235, 225, CUR('skill_elemental_barrier', '🔮'), 'Elemental Barrier', r => `Gain a shield equal to ${v(5 / 3 * r)}% of your maximum health at the start of combat`, { barrier: 5 / 3 }, null), buff: 1 }
    ];
    // GOTOWE NODY ŚCIEŻEK: st = statystyka małych nodów, b3 / b7 / b8 = duże nody (pozostałe miejsca to placeholdery 🔒)
    const PATHS = [
      // ścieżka l0 (y = 105, małe nody: Vitality – pasują do finału Life Essence, +maks. HP)
      { st: 'con',
        // LIGHTNING BOLT – Lightning Energy: 1 stos na start walki, +1 po każdym Twoim ataku; przy 5 stosach piorun uderza wroga za
        // 15% / 30% / 45% Twoich średnich obrażeń, potem stosy wracają do 1 (piorun co 4 ataki)
        b3: ['skill_lightning_bolt', '⚡', 'Lightning Incantation', r => `Gain a stack of Lightning Energy at the start of combat and every time you attack. At 5 stacks, a lightning bolt strikes your enemy for ${15 * r}% of your average damage, then your stacks reset to 1`, { bolt: 15 }],
        // OVERCHARGE – każdy kolejny piorun w walce mocniejszy o 10% / 20% / 30% (sumuje się: ×1, ×1.3, ×1.6 przy 3/3)
        b7: ['skill_overcharge', '🌩️', 'Overcharge', r => `Every subsequent lightning bolt from Lightning Incantation in combat is ${20 * r}% stronger than the previous one`, { boltGrow: 20 }],   // 20% / 40% / 60% – mnoży się z każdym piorunem
        // LIFE ESSENCE (dawniej Arcane Fortitude) – +6.67% / 13.33% / 20% maks. HP (jak Iron Will i Shadow Prayers; hpPct sumuje się z nimi)
        b8: ['skill_life_essence', '💠', 'Life Essence', r => `Increases your maximum health by ${v(20 / 3 * r)}%`, { hpPct: 20 / 3 }] },
      // ścieżka l1 (y = 225, małe nody: Dexterity – pasują do finału Blazing Reflexes, +% Dexterity)
      { st: 'dex',
        // FIRE INCANTATION (dawniej Combustion) – Fire Energy: +1 stos po każdym Twoim krytyku; przy 5 stosach wybuch za 3.33% / 6.67% / 10% maks. HP wroga (było do 15%), stosy wracają do 0
        b3: ['skill_combustion', '🔥', 'Fire Incantation', r => `Gain a stack of Fire Energy at the start of combat and each time you deal a critical hit. At 5 stacks, the stacks detonate for ${v(10 / 3 * r)}% of the enemy maximum health as damage, then your stacks reset to 1`, { fire: 10 / 3 }],
        // LINGERING FLAMES (1/1) – wybuch Fire Energy podpala wroga: Burning, 1% maks. HP wroga co turę przez 5 tur
        b7: ['skill_lingering_flames', '♨️', 'Lingering Flames', 'Detonating Fire Energy leaves the enemy Burning, dealing 1% of its maximum health every turn for 5 turns', { burn: 1 }, 1],
        // BLAZING REFLEXES – +6.67% / 13.33% / 20% Dexterity (jak Unholy Grace; dexPct sumuje się)
        b8: ['skill_blazing_reflexes', '🌟', 'Blazing Reflexes', r => `Increases your Dexterity by ${v(20 / 3 * r)}%`, { dexPct: 20 / 3 }] },
      // ścieżka l2 (y = 345, małe nody: Strength – finał Mist Veil nie daje statystyki, więc zostaje trzecia z trzech)
      { st: 'str',
        // TIDAL RENEWAL – Water Energy: +1 stos za każdy atak wroga; przy 5 stosach leczenie 2% / 4% / 6% maks. HP, stosy wracają do 0
        b3: ['skill_tidal_renewal', '💧', 'Water Incantation', r => `Gain a stack of Water Energy at the start of combat and each time you are attacked. At 5 stacks, heal yourself for ${2 * r}% of your maximum health, then your stacks reset to 1`, { water: 2 }],
        // SOOTHING TIDE (1/1) – leczenie z Water Energy daje +40% pancerza (było 20%) na 2 kolejne ataki wroga; tide = % pancerza
        b7: ['skill_soothing_tide', '🌊', 'Soothing Tide', 'Healing from Water Energy increases your armor by 40% for 2 turns', { tide: 40 }, 1],
        // MIST VEIL – szansa wroga na krytyk −3 / −6 / −9 punktów procentowych (nie mniej niż 0%)
        b8: ['skill_mist_veil', '🌫️', 'Mist Veil', r => `Decreases your opponent critical hit chance by ${3 * r}%`, { critDown: 3 }] }
    ];
    [105, 225, 345].forEach((y, p) => {
      const id = i => `l${p}_${i}`, P = PATHS[p];
      const small = (i, x) => P ? plus1(id(i), i === 0 ? 'lr' : id(i - 1), -x, y, P.st, null) : ph(id(i), i === 0 ? 'lr' : id(i - 1), -x, y, 's');
      const bigN = (i, x, k) => P && P[k] ? big(id(i), id(i - 1), -x, y, CUR(P[k][0], P[k][1]), P[k][2], P[k][3], P[k][4], null, P[k][5] || 3) : ph(id(i), id(i - 1), -x, y, 'b');
      [315, 375, 435].forEach((x, i) => a.push(small(i, x)));
      a.push(bigN(3, 520, 'b3'));
      [605, 665, 725].forEach((x, i) => a.push(small(i + 4, x)));
      a.push(bigN(7, 810, 'b7'), bigN(8, 925, 'b8'));
    });
    a.find(n => n.id === 'l1_7').debuff = 1;   // Lingering Flames: etykieta „Debuff” w dymku
    a.find(n => n.id === 'l2_7').buff = 1;     // Soothing Tide: etykieta „Buff”
    // MASTER OF ALL ELEMENTS (finał, jak Torment / Endure): linie od trzech finałów; wymaga wymaksowania wszystkich trzech.
    // Lightning / Fire / Water Incantation działają przy 4 stosach zamiast 5 (piorun co 3 ataki, wybuch po 4 krytykach, leczenie po 4 atakach wroga)
    a.push({ id: 'lj', from: 'l1_8', fromX: ['l0_8', 'l2_8'], reqAny: ['l0_8', 'l1_8', 'l2_8'], reqN: 3, vis: null, x: -1055, y: 225, k: 'b',
      ic: CUR('skill_master_of_elements', '🌀'), n: 'Master of All Elements', d: 'Decreases the stacks needed for Lightning, Fire and Water Incantation to 4', eff: { elemMaster: 1 }, max: 1 });
    return a;
  })()
];

// DODATKOWE 3 MAŁE NODY w każdej ścieżce (wszystkie 3 gałęzie): między przedostatnim (x 810) a ostatnim skillem ścieżki, ta sama
// statystyka co pozostałe małe nody tej ścieżki. Ostatni skill przesunięty na x 1100, finał gałęzi (Torment / Endure / Master of All
// Elements) na x 1230 (plansza drzewka poszerzona do 2800 px w ui.js). ID: s7–s9, c7–c9, b7–b9 (klątwy), d0_9–d0_11 itd. (wojownik),
// l0_9–l0_11 itd. (mag). Ostatni skill wymaga teraz wykupienia tych 3 nodów.
[
  ['ex', 'shp', i => 's' + (7 + i), 'con', 'fr'], ['te', 'ds', i => 'c' + (7 + i), 'str', 'fr'], ['fe', 'ug', i => 'b' + (7 + i), 'dex', 'fr'],
  ['d0_7', 'd0_8', i => 'd0_' + (9 + i), 'dex', 'dt'], ['d1_7', 'd1_8', i => 'd1_' + (9 + i), 'str', 'dt'], ['d2_7', 'd2_8', i => 'd2_' + (9 + i), 'con', 'dt'],
  ['l0_7', 'l0_8', i => 'l0_' + (9 + i), 'con', null], ['l1_7', 'l1_8', i => 'l1_' + (9 + i), 'dex', null], ['l2_7', 'l2_8', i => 'l2_' + (9 + i), 'str', null]
].forEach(([b7, b8, id, st, vis]) => {
  const n8 = UPG.find(n => n.id === b8), sg = Math.sign(n8.x);
  [895, 955, 1015].forEach((x, i) => UPG.push(plus1(id(i), i ? id(i - 1) : b7, sg * x, n8.y, st, vis)));
  n8.from = n8.req = id(2); n8.x = sg * 1100;
});
UPG.filter(n => ['ag', 'dj', 'lj'].includes(n.id)).forEach(n => { n.x = Math.sign(n.x) * 1230; });

// UNIKATY: zawsze te same statystyki (nie losowane). Każdy przedmiot mityczny ma cytat (quote) pokazywany w dymku. img = własna grafika w assets/unique/ (nie jest jednym z losowych sprite'ów hełmów).
// Abyssal Lure Hood – hełm do łowienia (strona 2 ekwipunku), mityczny, 50 FP; special drop z Lewiatana (1%, jednorazowo)
export const UNIQUES = {
  lure_hood: { sl: 'helm', r: 5, name: "Abyssal Lure Hood", isFishGear: 1, fp: 50, val: 2000, img: 'unique/helm_lure_hood.png', e: '🎣', quote: 'In the dark, you are the light. And the bait.' }
};
export const makeUnique = k => { const u = UNIQUES[k]; return { sl: u.sl, r: u.r, name: u.name, isFishGear: u.isFishGear, fp: u.fp, val: u.val, unique: k, s: {} }; };

// PRZEDMIOTY O STAŁYCH STATYSTYKACH (nie unikaty – zwykła rzadkość). Własna grafika (img), której nie używa żaden inny przedmiot.
// Angler Boonie – kapelusz do łowienia (slot hełmu na stronie 2), uncommon, 25 FP; special drop z Dorsza (2%, jednorazowo)
// BONUSY SETOWE sprzętu rybackiego (liczone z założonych przedmiotów na stronie 2 ekwipunku – eq2).
// pieces = klucze FIXED_ITEMS; bonus[] = próg liczby części → efekt (sumuje się z drzewkiem):
//   time = −% czasu łowienia (Fishing time), dbl = +% Double Catch, bycatch = +% Bycatch
export const FISH_SETS = {
  // Seasoned Angler (rare, crafting z Catfish). Zwykły Angler (uncommon) na razie bez bonusu setowego.
  seasoned: { name: 'Seasoned Angler', pieces: ['seasoned_cap', 'seasoned_parka', 'seasoned_wellies', 'seasoned_lantern'], bonus: [
    { n: 2, eff: { time: 5 }, d: 'Fishing time -5%' },
    { n: 4, eff: { dbl: 3 }, d: '+3% Double Catch' }
  ] },
  // Sea Raider (epic, crafting z Anglerfish)
  raider: { name: 'Sea Raider', pieces: ['hunter_helmet', 'hunter_parka', 'hunter_wellies', 'hunter_lantern'], bonus: [
    { n: 2, eff: { dbl: 10 }, d: '+10% Double Catch' },
    { n: 4, eff: { time: 10 }, d: 'Fishing time -10%' }
  ] },
  // Sea King (legendary, special drop z Leviathana)
  king: { name: 'Sea King', pieces: ['king_crown', 'king_plate', 'king_boots', 'king_lantern'], bonus: [
    { n: 2, eff: { triple: 10 }, d: '+10% Triple Catch' },
    { n: 3, eff: { time: 15 }, d: 'Fishing time -15%' },
    { n: 4, eff: { treasure: 5 }, d: '+5% Treasure chance' }
  ] }
};
// BONUSY SETOWE sprzętu BOJOWEGO (liczone z ekwipunku strona 1 – eq1). crit = +% szansy na krytyk (ponad limit 50%),
// critDmg = +% obrażeń krytyka (doliczane do mnożnika, np. 180% → 185%). Liczone w state.js (der) i pokazywane w dymku przedmiotu.
export const GEAR_SETS = {
  // Forgotten (rare, Spiderling) – miecz Forgotten Edge NIE należy do setu
  forgotten: { name: 'Forgotten', pieces: ['forgotten_cuirass', 'forgotten_pendant', 'forgotten_aegis'], bonus: [
    { n: 2, eff: { crit: 5 }, d: '+5% Crit chance' },
    { n: 3, eff: { critDmg: 5 }, d: '+5% Crit damage' }
  ] },
  // Chitin (rare, Spider Servant) – 3/3: +100 Armor (płasko, liczone razem z pancerzem z przedmiotów)
  chitin: { name: 'Chitin', pieces: ['chitin_carapace', 'silkstep_boots', 'spider_eye_charm'], bonus: [
    { n: 3, eff: { arm: 100 }, d: '+100 Armor' }
  ] },
  // Widow (rare, Spider Queen) – Widow Spear NIE należy do setu; 3/3: +20% Crit damage
  widow: { name: 'Widow', pieces: ['widow_ring', 'widowgrip_gauntlets', 'widow_helm'], bonus: [
    { n: 3, eff: { critDmg: 20 }, d: '+20% Crit damage' }
  ] }
};
// fx = bonusy łowienia przedmiotu (oprócz FP): time = −% czasu łowienia, dbl = Double Catch %, triple = Triple Catch %,
// treasure = Treasure chance %, bycatch = Bycatch chance %. Liczone na żywo z tej tabeli (ui.js → gearFx), więc stare zapisy dostają je od razu.
export const FIXED_ITEMS = {
  // Forgotten Edge – miecz z lochu (Spiderling, 10%), rare, ZAWSZE te same statystyki: 32-50 Damage, +10 Strength, +10 Vitality; wymaga 12 poziomu.
  // Grafika tylko dla tego miecza (nie wypada z wyprawy).
  forgotten_edge: { sl: 'weapon', r: 2, name: 'Forgotten Edge', s: { str: 10, con: 10 }, d: [32, 50], req: 12, val: 300, img: 'dungeon/weapon_forgotten_edge.png', e: '🗡️' },
  // Komplet ze Spiderlinga (rare, wymaga 12 poziomu, stałe statystyki – pula 16–19): zbroja 5%, wisior 3%, tarcza 8% (miecz 10%)
  // Forgotten Fang – nóż w stylu djatla (szerokie ostrze ku czubkowi), Spiderling 2%, rare, 35-40 Damage, +18 Dexterity, +5 Vitality; poza setem Forgotten
  forgotten_fang: { sl: 'weapon', r: 2, name: 'Forgotten Fang', s: { dex: 18, con: 5 }, d: [35, 40], req: 12, val: 300, img: 'dungeon/weapon_forgotten_fang.png', e: '🔪' },
  forgotten_cuirass: { sl: 'armor', r: 2, name: 'Forgotten Cuirass', s: { arm: 59, con: 10, str: 9 }, req: 12, val: 300, img: 'dungeon/armor_forgotten_cuirass.png', e: '🛡️' },
  forgotten_pendant: { sl: 'amulet', r: 2, name: 'Forgotten Pendant', s: { str: 8, dex: 8 }, req: 12, val: 300, img: 'dungeon/amulet_forgotten_pendant.png', e: '📿' },
  forgotten_aegis: { sl: 'shield', r: 2, name: 'Forgotten Aegis', s: { arm: 46, con: 10, dex: 7 }, req: 12, val: 300, img: 'dungeon/shield_forgotten_aegis.png', e: '🛡️' },
  // ZESTAW PAJĄKA – special dropy ze Spider Servant (Spider's Den, 20 poziom), epic, 20% każdy; na razie: zbroja i buty 20 Armor,
  // wszystkie po +20 Strength / Dexterity / Vitality (talizman bez pancerza). Wymagają 18 poziomu. Własne grafiki w assets/dungeon/.
  // ZESTAW CHITIN – special drop ze Spider Servant (20 poziom), rare, wymaga 21 poziomu. Statystyki = średni losowy rare na 20 poziomie +20%:
  // pula statystyk 36 → 43, pancerz: zbroja 110 → 132, buty 47 → 56 (talizman bez pancerza – tylko pula 43).
  chitin_carapace: { sl: 'armor', r: 2, name: 'Chitin Carapace', s: { arm: 132, str: 14, dex: 11, con: 18 }, req: 21, val: 750, img: 'dungeon/armor_chitin_carapace.png', e: '🛡️' },
  // Chitin Halberd – broń ze Spider Servant (6%), rare, poza setem Chitin. Losowy rare na 20 poziomie +20%: obrażenia 45-67 (śr. 56; ciężka broń z dużym rozrzutem), pula 36 → 43
  chitin_halberd: { sl: 'weapon', r: 2, name: 'Chitin Halberd', s: { str: 22, con: 14, dex: 7 }, d: [45, 67], req: 21, val: 750, img: 'dungeon/weapon_chitin_halberd.png', e: '🪓' },
  silkstep_boots: { sl: 'boots', r: 2, name: 'Silkstep Boots', s: { arm: 56, str: 13, dex: 18, con: 12 }, req: 21, val: 750, img: 'dungeon/boots_silkstep.png', e: '👢' },
  // ZESTAW WIDOW – special drop ze Spider Queen (26 poziom), rare, wymaga 26 poziomu. Statystyki = średni losowy rare na 26 poziomie +20%:
  // pula statystyk 46 → 56, pancerz: hełm 100 → 120, rękawice 70 → 84; włócznia: średnie obrażenia 51 → 62 (50-74, obrażenia nie zależą od rzadkości).
  widow_spear: { sl: 'weapon', r: 2, name: 'Widow Spear', s: { str: 24, dex: 20, con: 12 }, d: [50, 74], req: 26, val: 800, img: 'dungeon/weapon_widow_spear.png', e: '🔱' },
  widow_ring: { sl: 'ring', r: 2, name: 'Widow Ring', s: { str: 19, dex: 19, con: 18 }, req: 26, val: 800, img: 'dungeon/ring_widow.png', e: '💍' },
  widowgrip_gauntlets: { sl: 'gloves', r: 2, name: 'Widowgrip Gauntlets', s: { arm: 84, dex: 24, str: 20, con: 12 }, req: 26, val: 800, img: 'dungeon/gloves_widowgrip.png', e: '🧤' },
  widow_helm: { sl: 'helm', r: 2, name: 'Widow Helm', s: { arm: 120, con: 24, str: 17, dex: 15 }, req: 26, val: 800, img: 'dungeon/helm_widow.png', e: '⛑️' },
  // WIDOWS HEART – bardzo rzadka osobna nagroda ze Spider Queen (0.4%), epic, poza setem Widow; +40 Strength, +40 Dexterity, wymaga 26 poziomu
  widows_heart: { sl: 'amulet', r: 3, name: 'Widows Heart', s: { str: 40, dex: 40 }, req: 26, val: 2000, img: 'dungeon/amulet_widows_heart.png', e: '📿' },
  spider_eye_charm: { sl: 'trinket', r: 2, name: 'Spider Eye Charm', s: { str: 15, dex: 14, con: 14 }, req: 21, val: 750, img: 'dungeon/trinket_spider_eye.png', e: '🧿' },
  boonie: { sl: 'helm', r: 1, name: "Angler Boonie", isFishGear: 1, fp: 25, fx: { treasure: 0.5 }, val: 100, img: 'fishing_gear/helm_boonie.png', e: '👒' },
  // Angler Wellies – kalosze do łowienia (slot butów na stronie 2), uncommon, 25 FP; special drop z Dorsza (2%, jednorazowo)
  wellies: { sl: 'boots', r: 1, name: "Angler Wellies", isFishGear: 1, fp: 25, fx: { bycatch: 1 }, val: 100, img: 'fishing_gear/boots_wellies.png', e: '🥾' },
  // Angler Parka – płaszcz do łowienia (slot zbroi na stronie 2), uncommon, 25 FP; special drop z Dorsza (2%, jednorazowo)
  parka: { sl: 'armor', r: 1, name: "Angler Parka", isFishGear: 1, fp: 25, fx: { triple: 0.5 }, val: 100, img: 'fishing_gear/armor_parka.png', e: '🧥' },
  // Angler Lantern – latarnia do łowienia (slot latarni = miejsce tarczy na stronie 2), uncommon, 25 FP; special drop z Dorsza (2%, jednorazowo)
  lantern: { sl: 'lantern', r: 1, name: "Angler Lantern", isFishGear: 1, fp: 25, fx: { dbl: 2 }, val: 100, img: 'fishing_gear/lantern.png', e: '🏮' },
  // Catfish Whisker Charm – talizman do łowienia (slot talizmanu na stronie 2), rare, 45 FP (było 40); special drop z Suma (2%, jednorazowo)
  whisker_charm: { sl: 'trinket', r: 2, name: 'Catfish Whisker Charm', isFishGear: 1, fp: 45, fx: { bycatch: 4 }, val: 200, img: 'fishing_gear/trinket_whisker_charm.png', e: '🧿' },
  // Catfish Whisker Amulet / Ring – komplet z talizmanem (strona 2: slot amuletu / pierścienia), rare, 45 FP (było 40); special dropy z Suma (2%, jednorazowo)
  whisker_amulet: { sl: 'amulet', r: 2, name: 'Catfish Whisker Amulet', isFishGear: 1, fp: 45, fx: { treasure: 1 }, val: 200, img: 'fishing_gear/amulet_whisker.png', e: '📿' },
  whisker_ring: { sl: 'ring', r: 2, name: 'Catfish Whisker Ring', isFishGear: 1, fp: 45, fx: { dbl: 3 }, val: 200, img: 'fishing_gear/ring_whisker.png', e: '💍' },
  // Seasoned Angler – komplet wędkarza RARE (niebieski, „tier wyżej” od Angler z Dorsza): kaszkiet, płaszcz, kalosze;
  // po 45 FP; zdobywane TYLKO craftingiem (Crafting → Fishing Gear: część Angler + 5 Łusek suma, po nauce z Crafting Design)
  seasoned_cap: { sl: 'helm', r: 2, name: "Seasoned Angler Cap", isFishGear: 1, fp: 45, fx: { treasure: 1.2 }, val: 200, img: 'fishing_gear/helm_flatcap_rare.png', e: '🧢' },
  seasoned_parka: { sl: 'armor', r: 2, name: "Seasoned Angler Parka", isFishGear: 1, fp: 45, fx: { triple: 1 }, val: 200, img: 'fishing_gear/armor_parka_rare.png', e: '🧥' },
  seasoned_wellies: { sl: 'boots', r: 2, name: "Seasoned Angler Wellies", isFishGear: 1, fp: 45, fx: { bycatch: 2 }, val: 200, img: 'fishing_gear/boots_wellies_rare.png', e: '🥾' },
  seasoned_lantern: { sl: 'lantern', r: 2, name: "Seasoned Angler Lantern", isFishGear: 1, fp: 45, fx: { dbl: 4 }, val: 200, img: 'fishing_gear/lantern_rare.png', e: '🏮' },
  // Sea Raider – komplet wędkarza EPIC (fioletowy, mroczny, „tier wyżej” od Seasoned Angler): hełm z wizjerem, płaszcz, kalosze, latarnia;
  // po 70 FP (latarnia też 70 – było 65); zdobywane TYLKO craftingiem (Crafting → Fishing Gear: część Seasoned Angler + 5 Light of Anglerfish, po nauce z Crafting Design z Żabnicy / Anglerfish)
  hunter_helmet: { sl: 'helm', r: 3, name: "Sea Raider Helmet", isFishGear: 1, fp: 70, fx: { triple: 3 }, val: 400, img: 'fishing_gear/helm_visor_epic.png', e: '⛑️' },
  hunter_parka: { sl: 'armor', r: 3, name: "Sea Raider Parka", isFishGear: 1, fp: 70, fx: { treasure: 3 }, val: 400, img: 'fishing_gear/armor_parka_epic.png', e: '🧥' },
  hunter_wellies: { sl: 'boots', r: 3, name: "Sea Raider Wellies", isFishGear: 1, fp: 70, fx: { dbl: 6 }, val: 400, img: 'fishing_gear/boots_wellies_epic.png', e: '🥾' },
  // latarnia (slot latarni = miejsce tarczy na stronie 2): fioletowa oprawa, turkusowe światło jak wabik żabnicy
  hunter_lantern: { sl: 'lantern', r: 3, name: "Sea Raider Lantern", isFishGear: 1, fp: 70, fx: { bycatch: 8 }, val: 400, img: 'fishing_gear/lantern_epic.png', e: '🏮' },
  // Anglerfish Lure Necklace – naszyjnik do łowienia (slot amuletu na stronie 2), epic, 70 FP (było 80); special drop z Żabnicy / Anglerfish (5%, jednorazowo).
  // Osobny przedmiot – NIE jest ulepszeniem innego amuletu (brak przepisu w craftingu). Wisior: kula światła żabnicy w kłach, łańcuszek V.
  // Ring of the Tide – pierścień do łowienia (slot pierścienia na stronie 2), epic, 70 FP (było 80); zdobywany TYLKO craftingiem:
  // 9 Eye of Cod + 9 Catfish Scale + 9 Barracuda Fang + 9 Light of Anglerfish (po nauce projektu Crafting Design z Barrakudy, 2%)
  // Sprite: oczko Light of Anglerfish w łapkach z kłów barrakudy, wstawki z łusek suma, oko dorsza na dole złotej obrączki
  tide_ring: { sl: 'ring', r: 3, name: 'Ring of the Tide', isFishGear: 1, fp: 70, fx: { dbl: 6 }, val: 400, img: 'fishing_gear/ring_tide.png', e: '💍' },
  lure_necklace: { sl: 'amulet', r: 3, name: 'Anglerfish Lure Necklace', isFishGear: 1, fp: 70, fx: { treasure: 3 }, val: 400, img: 'fishing_gear/amulet_anglerfish.png', e: '📿' },
  // Shark Eye Trophy – talizman do łowienia (slot talizmanu na stronie 2), epic, 70 FP (jak inne epickie sloty; zastępuje Whisker Charm 45 → +25 FP);
  // special drop z Rekina / Shark (3%, jednorazowo). Sprite: oko rekina (złota tęczówka, pionowa źrenica) w szklanej kuli z płynem na fioletowej podstawce ze złotą tabliczką.
  shark_eye: { sl: 'trinket', r: 3, name: 'Shark Eye Trophy', isFishGear: 1, fp: 70, fx: { bycatch: 10 }, val: 400, img: 'fishing_gear/trinket_shark_eye_trophy.png', e: '🦈' },
  // Sea King – komplet wędkarza LEGENDARY (złoty, styl władcy mórz: perły Warm Ivory, morskie klejnoty Teal / Icy Blue), „tier wyżej” od Sea Raider:
  // korona (slot hełmu), napierśnik (slot zbroi), para butów (tylny ×0.45), latarnia ze świecącą perłą; po 110 FP.
  // Special drop z Lewiatana: każda część 2%, jednorazowo (flagi: fishing.kingCrown / kingPlate / kingBoots / kingLantern).
  king_crown: { sl: 'helm', r: 4, name: 'Sea King Crown', isFishGear: 1, fp: 110, fx: { dbl: 10 }, val: 800, img: 'fishing_gear/helm_crown_legendary.png', e: '👑' },
  king_plate: { sl: 'armor', r: 4, name: 'Sea King Plate', isFishGear: 1, fp: 110, fx: { triple: 5 }, val: 800, img: 'fishing_gear/armor_parka_legendary.png', e: '🦺' },
  king_boots: { sl: 'boots', r: 4, name: 'Sea King Boots', isFishGear: 1, fp: 110, fx: { bycatch: 20 }, val: 800, img: 'fishing_gear/boots_wellies_legendary.png', e: '🥾' },
  king_lantern: { sl: 'lantern', r: 4, name: 'Sea King Lantern', isFishGear: 1, fp: 110, fx: { treasure: 8 }, val: 800, img: 'fishing_gear/lantern_legendary.png', e: '🏮' }
};
// assets/fishing_gear/ – ekwipunek do łowienia: KAŻDY przedmiot ma tu własny, osobny sprite (żaden nie jest współdzielony)
export const makeFixed = k => { const u = FIXED_ITEMS[k]; const o = { sl: u.sl, r: u.r, name: u.name, isFishGear: u.isFishGear, fp: u.fp, val: u.val, fixed: k, s: Object.assign({}, u.s || {}) };
  if (u.d) { o.d = u.d.slice(); o.dv = 2; }   // broń o stałych obrażeniach (nie przeliczana przez migrację)
  if (u.req) o.req = u.req;                    // wymagany poziom postaci do założenia
  return o; };
