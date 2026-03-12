// Grounding data: Key policy positions per party based on party programs and public statements (2024-2026)
// Sources: Party websites, principprogram, Folketinget voting records, DR/Altinget policy analyses

const partyPositions = {
  S: {
    name: "Socialdemokratiet",
    positions: {
      skat: "Vil bevare det nuværende skatteniveau. Imod topskattelettelser. For progressiv beskatning.",
      klima: "Støtter grøn omstilling men med hensyn til arbejdspladser. Støtter havvind. Skeptisk over for hurtig udfasning af landbrug.",
      udlaendinge: "Stram udlændingepolitik. Færre asylansøgere. Fokus på integration og arbejdskrav. Modstand mod parallelsamfund.",
      sundhed: "Flere hænder i sundhedsvæsenet. Vil styrke det offentlige sygehusvæsen. Gratis tandlæge for unge.",
      forsvar: "Støtter 2% af BNP til forsvar. Støtter NATO. Støtter Ukraine militært.",
      uddannelse: "Vil styrke erhvervsuddannelser. Bevare SU. For folkeskolen som grundpille.",
      bolig: "Vil bygge flere almene boliger. Imod fri huslejeregulering.",
      arbejdsmarked: "Støtter den danske model. Tidlig pension for nedslidte (Arne-pension). Imod løntrykkeri.",
      eu: "Pro-EU men med forbehold. Støtter dansk EU-deltagelse i forsvar efter 2022-afstemning.",
      vaerdier: "Bevar monarkiet. Moderat på værdipolitik. Støtter folkekirken.",
      energi: "Støtter vedvarende energi. Åben over for atomkraft som supplement. Store havvindprojekter.",
      retspolitik: "Hårde straffe for bandekriminalitet. Støtter overvågning for sikkerhed."
    }
  },
  V: {
    name: "Venstre",
    positions: {
      skat: "Vil sænke skatten for erhvervslivet og middelklassen. Lavere selskabsskat. Imod nye skatter.",
      klima: "Grøn omstilling gennem teknologi og markedsløsninger. Støtter atomkraft. Imod forbud og tvang.",
      udlaendinge: "Stram udlændingepolitik. Krav om selvforsørgelse. Fokus på arbejdskraftindvandring.",
      sundhed: "Støtter frit sygehusvalg inkl. privathospitaler. Vil reducere ventelister.",
      forsvar: "Stærkt forsvar. Støtter NATO og 2%+. Pro-Ukraine. Længere værnepligt.",
      uddannelse: "Vil styrke faglighed. For nationale test. Mere frihed til skolerne.",
      bolig: "Markedsbaseret boligpolitik. Imod overregulering. Støtter byggeri i landdistrikter.",
      arbejdsmarked: "Lavere dagpenge for at øge arbejdsudbud. Flere i arbejde. Imod borgerløn.",
      eu: "Pro-EU. Støtter det indre marked og samarbejde.",
      vaerdier: "Bevar monarkiet. Støtter folkekirken. Traditionelle danske værdier.",
      energi: "Støtter atomkraft. Teknologineutral energipolitik. Imod ensidigt vindmølle-fokus.",
      retspolitik: "Hårdere straffe. Mere politi. Støtter videoovervågning.",
      landdistrikter: "Kæmper for landdistrikter. Vil flytte statslige arbejdspladser ud. Bedre infrastruktur."
    }
  },
  M: {
    name: "Moderaterne",
    positions: {
      skat: "Moderat skattepolitik. Imod store skattelettelser og store skattestigninger.",
      klima: "Pragmatisk grøn omstilling. Åben for atomkraft. Balancerer miljø og økonomi.",
      udlaendinge: "Moderat stram udlændingepolitik. Fokus på integration gennem arbejde.",
      sundhed: "Vil modernisere sundhedsvæsenet. Åben for offentlig-privat samarbejde.",
      forsvar: "Støtter øget forsvar. Pro-NATO. Pragmatisk udenrigspolitik.",
      eu: "Stærkt pro-EU. Vil afskaffe danske EU-forbehold. Mere europæisk samarbejde.",
      vaerdier: "Liberal på værdipolitik. Centrumpolitik. Vil samle bredt.",
      arbejdsmarked: "Vil øge arbejdsudbud. Moderat reformpolitik."
    }
  },
  SF: {
    name: "SF",
    positions: {
      skat: "Højere skat på de rigeste. Formueskat. Vil finansiere velfærd gennem skat.",
      klima: "Meget ambitiøs klimapolitik. Hurtig grøn omstilling. CO2-afgifter. Imod atomkraft.",
      udlaendinge: "Mere human udlændingepolitik end S. Støtter kvoteflygtninge. Fokus på rettigheder.",
      sundhed: "Massiv investering i offentlig sundhed. Imod privatisering. Vil styrke psykiatrien.",
      forsvar: "Støtter forsvar men prioriterer velfærd. Støtter Ukraine.",
      uddannelse: "Vil afskaffe karakterer i folkeskolen. Mere trivsel. Højere SU.",
      bolig: "Flere almene boliger. Regulering af boligmarkedet. Imod spekulationsopkøb.",
      arbejdsmarked: "Kortere arbejdstid. 6. ferieuge. Bedre vilkår for lavtlønnede.",
      vaerdier: "Progressiv værdipolitik. Vil adskille kirke og stat. Støtter ligestilling.",
      kultur: "Stor kunststøtte. Styrk DR og public service. Kultur er essentielt.",
      energi: "100% vedvarende energi. Imod atomkraft. Sol, vind og bølgekraft.",
      natur: "20% af Danmark skal være vild natur. Biodiversitet. Imod motorvejsudvidelser."
    }
  },
  LA: {
    name: "Liberal Alliance",
    positions: {
      skat: "Markant lavere skatter. Afskaf topskatten. Lavere selskabsskat. Minimal stat.",
      klima: "Klimapolitik gennem teknologi, ikke forbud. Stærk støtte til atomkraft. Imod CO2-afgifter.",
      udlaendinge: "Liberal på arbejdskraftindvandring. Stram på asyl.",
      sundhed: "Frit valg mellem offentlige og private hospitaler. Mere konkurrence i sundhed.",
      forsvar: "Stærkt forsvar. Høj forsvarsudgift. Pro-NATO og pro-Ukraine.",
      uddannelse: "Mere frihed til friskoler. Imod statslig detailstyring. Faglighed over trivsel.",
      bolig: "Fri markedsregulering af boliger. Afskaf huslejeregulering.",
      arbejdsmarked: "Lavere dagpenge. Imod borgerløn. Skattefrihed for nye virksomheder. Iværksætteri.",
      eu: "Pro-EU's indre marked. Imod overregulering fra Bruxelles.",
      vaerdier: "Liberale frihedsrettigheder. Legalisér cannabis. Imod statslig overvågning. Privatlivets fred.",
      kultur: "Halvér DR. Lad markedet bestemme kultur. Imod kunststøtte.",
      energi: "Atomkraft som hovedløsning. Teknologineutral. Imod vindmøllesubsidier."
    }
  },
  K: {
    name: "Konservative",
    positions: {
      skat: "Lavere skat på arbejde og virksomheder. Borgerlig skattepolitik.",
      klima: "Grøn omstilling med atomkraft som nøgle. Teknologisk innovation frem for afgifter.",
      udlaendinge: "Stram udlændingepolitik. Krav om integration. Færre asylansøgere.",
      sundhed: "Frit valg inkl. private hospitaler. Mere kvalitet i sundhed.",
      forsvar: "Meget stærkt forsvar. 3%+ af BNP. Værnepligt. Pro-NATO. Traditionel forsvarspolitik.",
      uddannelse: "Faglighed og nationale test. Respekt for autoritet i skolen.",
      vaerdier: "Bevar monarkiet. Bevar folkekirken. Traditionelle værdier. Konservativ familiepolitik.",
      retspolitik: "Hårde straffe. Mere politi. Nultolerance over for kriminalitet.",
      energi: "Pro-atomkraft. Teknologisk innovation. Stabil energiforsyning.",
      kultur: "Bevar dansk kulturarv. Moderat kunststøtte."
    }
  },
  EL: {
    name: "Enhedslisten",
    positions: {
      skat: "Markant højere skat på rige og virksomheder. Formueskat. Millionærskat.",
      klima: "Radikal grøn omstilling. System change. Imod atomkraft. 100% vedvarende.",
      udlaendinge: "Human flygtningepolitik. Flere kvoteflygtninge. Imod stramninger. Solidaritet.",
      sundhed: "Alt sundhed skal være offentligt. Imod privatisering. Gratis tandlæge for alle. Styrk psykiatrien.",
      forsvar: "Skeptisk over for militær oprustning. Fredspolitik. Kritisk over for NATO.",
      uddannelse: "Afskaf karakterer. Højere SU. Gratis uddannelse. Mere trivsel.",
      bolig: "Massivt alment boligbyggeri. Forbyd boligspekulanter. Huslejestop.",
      arbejdsmarked: "30-timers arbejdsuge. 6. ferieuge. Borgerløn. Stærkere fagbevægelse. Tidlig pension.",
      vaerdier: "Afskaf monarkiet (republik). Adskil kirke og stat. Progressiv værdipolitik.",
      kultur: "Stor kunststøtte. Styrk DR. Kultur er en rettighed.",
      natur: "Vild natur. Halvér kvægproduktion. Forbyd pesticider.",
      retspolitik: "Imod overvågning. Privatlivets fred. Forebyggelse frem for straf. Investér i udsatte områder.",
      energi: "Imod atomkraft. Sol og vind. Nationalisér energiselskaber."
    }
  },
  R: {
    name: "Radikale Venstre",
    positions: {
      skat: "Moderat skattepolitik. Grønne afgifter. Imod topskattelettelser.",
      klima: "Ambitiøs klimapolitik. CO2-afgifter. Grøn omstilling med markedsmekanismer.",
      udlaendinge: "Liberal udlændingepolitik. Kvoteflygtninge. International solidaritet.",
      sundhed: "Styrk det offentlige sundhedsvæsen. Investér i forebyggelse.",
      forsvar: "Støtter forsvar og NATO. Vil styrke EU-samarbejde om forsvar.",
      uddannelse: "Mere trivsel. Afskaf karakterpres. Investér i uddannelse.",
      eu: "Mest pro-EU parti. Afskaf alle forbehold. Føderalt EU. EU-forsvarsunion.",
      vaerdier: "Adskil kirke og stat. Progressiv. Legalisér cannabis. Individuel frihed.",
      kultur: "Stor kunststøtte. Styrk public service og kulturinstitutioner.",
      natur: "Mere natur. Biodiversitet. Grønne korridorer.",
      energi: "Vedvarende energi. Åben for atomkraft som supplement."
    }
  },
  DF: {
    name: "Dansk Folkeparti",
    positions: {
      skat: "Bevare velfærd gennem skat. Imod skattelettelser til de rigeste.",
      klima: "Skeptisk over for dyr klimapolitik. Imod CO2-afgifter der rammer danskere.",
      udlaendinge: "Meget stram udlændingepolitik. Fuld stop for ikke-vestlig indvandring. Hjemsendelse.",
      sundhed: "Styrk det offentlige sundhedsvæsen. Mere nærhed i sundhed.",
      forsvar: "Stærkt forsvar. Værnepligt. National suverænitet.",
      uddannelse: "Faglighed i skolen. Danske værdier. Dannelse.",
      eu: "EU-skeptisk. Vil have folkeafstemninger. Bevare danske forbehold. Imod mere EU-magt.",
      vaerdier: "Bevar monarkiet. Bevar folkekirken. Danske traditioner. National identitet.",
      retspolitik: "Hårde straffe. Nultolerance. Mere politi. Bandepakker.",
      landdistrikter: "Støtter landdistrikter. Imod centralisering. Bevar lokale sygehuse.",
      arbejdsmarked: "Tidlig pension. Imod nedslidning. Beskyt danske lønninger."
    }
  },
  DD: {
    name: "Danmarksdemokraterne",
    positions: {
      skat: "Moderat skattepolitik. Fokus på retfærdighed i skattesystemet.",
      klima: "Pragmatisk klimapolitik. Teknologi frem for forbud. Åben for atomkraft.",
      udlaendinge: "Meget stram udlændingepolitik. Nul asylansøgere i Danmark. Nærområdeindsats.",
      sundhed: "Bedre sundhed i hele landet. Imod centralisering.",
      forsvar: "Stærkt forsvar. Værnepligt. Pro-NATO. National sikkerhed.",
      eu: "EU-skeptisk. National suverænitet. Kritisk over for Bruxelles' magt.",
      vaerdier: "Danske værdier. Bevar traditioner. Bevar monarkiet.",
      retspolitik: "Hårde straffe. Mere politi. Bandepakker.",
      landdistrikter: "Flytte arbejdspladser ud. Mod hovedstadsfokus. Bedre vilkår for provinsen.",
      arbejdsmarked: "Tidlig pension for nedslidte. Beskyt danske arbejdspladser."
    }
  },
  ALT: {
    name: "Alternativet",
    positions: {
      skat: "Grønne skatter. Højere skat på forurenende aktiviteter. Støtter omfordeling.",
      klima: "Mest ambitiøse klimaparti. Systemisk omstilling. Cirkulær økonomi. Imod atomkraft.",
      udlaendinge: "Human udlændingepolitik. Åbne grænser. Solidaritet. Kvoteflygtninge.",
      sundhed: "Holistisk sundhed. Forebyggelse. Alternativ behandling. Styrk psykiatrien.",
      uddannelse: "Afskaf karakterer. Kreativitet over faglighed. Fri læring.",
      bolig: "Bofællesskaber. Bæredygtigt byggeri. Imod boligspekulanter.",
      arbejdsmarked: "Borgerløn. 30-timers uge. Ny definition af arbejde. Bæredygtig økonomi.",
      vaerdier: "Progressiv. Legalisér cannabis. Adskil kirke og stat. Eksperimenterende demokrati.",
      kultur: "Kunststøtte er essentiel. Fordobl kulturbudgettet. Styrk DR.",
      natur: "Rewilding. 20%+ vild natur. Forbyd pesticider. Halvér kødproduktion.",
      energi: "100% vedvarende. Sol, vind, bølger. Imod atomkraft. Decentraliseret energi."
    }
  }
};
