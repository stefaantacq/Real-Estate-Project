-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql_server:3306
-- Gegenereerd op: 11 feb 2026 om 14:13
-- Serverversie: 8.0.45
-- PHP-versie: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `compromAIs`
--

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `AangepastePlaceholder`
--

CREATE TABLE `AangepastePlaceholder` (
  `id` int NOT NULL,
  `dossier_id` int NOT NULL,
  `placeholder_id` int NOT NULL,
  `ingevulde_waarde` text,
  `validatiestatus` varchar(50) DEFAULT 'unverified',
  `correctheid` tinyint(1) DEFAULT '0',
  `onzekerheidsscore` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Gegevens worden geëxporteerd voor tabel `AangepastePlaceholder`
--

INSERT INTO `AangepastePlaceholder` (`id`, `dossier_id`, `placeholder_id`, `ingevulde_waarde`, `validatiestatus`, `correctheid`, `onzekerheidsscore`) VALUES
(174, 24, 24, 'Kegelslei', 'unverified', 0, NULL),
(175, 24, 12, 'Stéphane Joseph Henri', 'pending', 0, NULL),
(176, 24, 13, 'VERELST', 'pending', 0, NULL),
(177, 24, 14, 'Mechelen', 'pending', 0, NULL),
(178, 24, 15, '16 augustus 1964', 'pending', 0, NULL),
(179, 24, 16, 'Sint-Katelijne-Waver (Onze-Lieve-Vrouw-Waver), Waverlaan 2', 'pending', 0, NULL),
(180, 24, 17, 'An Maria Walter', 'pending', 0, NULL),
(181, 24, 18, 'VAN AS', 'pending', 0, NULL),
(182, 24, 19, 'Leuven', 'pending', 0, NULL),
(183, 24, 20, '21 januari 1976', 'pending', 0, NULL),
(184, 24, 21, 'Sint-Katelijne-Waver (Onze-Lieve-Vrouw-Waver), Waverlaan 2', 'unverified', 0, NULL),
(185, 24, 22, 'scheiding van goederen met beperkte gemeenschap', 'pending', 0, NULL),
(187, 24, 25, 'SINT-KATELIJNE-WAVER', 'pending', 0, NULL),
(188, 24, 26, 'ONZE-LIEVE-VROUW-WAVER', 'pending', 0, NULL),
(189, 24, 50, 'gewestplan Mechelen', 'pending', 0, NULL),
(190, 24, 51, 'agrarisch gebied bestemd voor de landbouw', 'pending', 0, NULL),
(191, 24, 52, '24.500,00 EUR', 'pending', 0, NULL),
(192, 24, 59, '2.450,00 EUR', 'pending', 0, NULL),
(193, 24, 60, '230-0122700-15', 'pending', 0, NULL),
(194, 24, 61, 'André Costa', 'pending', 0, NULL),
(195, 24, 73, 'tien frank ten honderd (10 %) ’s jaars', 'unverified', 0, NULL),
(196, 24, 87, '2861 Onze-Lieve-Vrouw-Waver, Dijk 34', 'pending', 0, NULL),
(197, 24, 88, '2861 Onze-Lieve-Vrouw-Waver, Dijk 34', 'unverified', 0, NULL),
(198, 24, 89, '3 maanden', 'pending', 0, NULL),
(199, 24, 92, 'Sint-Katelijne-Waver (Onze-Lieve-Vrouw-Waver)', 'pending', 0, NULL),
(200, 24, 93, '26 februari 2003', 'pending', 0, NULL),
(201, 24, 98, 'onder de gewone waarborgen van daad en van recht', 'unverified', 0, NULL),
(202, 24, 99, 'zonder waarborg van maat en oppervlakte; met alle voor- en nadelige erfdienstbaarheden; met alle zichtbare en verborgen gebreken', 'unverified', 0, NULL),
(203, 24, 102, '3 maanden', 'unverified', 0, NULL),
(204, 24, 111, 'niet-naleving door één van de partijen na ingebrekestelling (15 dagen)', 'unverified', 0, NULL),
(205, 24, 112, '10 %', 'pending', 0, NULL),
(206, 24, 117, 'Sint-Katelijne-Waver (Onze-Lieve-Vrouw-Waver)', 'unverified', 0, NULL),
(207, 24, 118, '26 februari 2003', 'unverified', 0, NULL),
(208, 24, 119, 'Jeu Alfons', 'unverified', 0, NULL),
(209, 24, 132, 'Jeu Alfons LENS', 'pending', 0, NULL),
(210, 24, 133, 'Onze-Lieve-Vrouw-Waver', 'pending', 0, NULL),
(211, 24, 134, '17 juni 1931', 'pending', 0, NULL),
(212, 24, 135, 'Schaben, Wordenfreinstienen 4/2', 'pending', 0, NULL),
(213, 24, 136, 'Een perceel landbouwgrond met bunker', 'pending', 0, NULL),
(214, 24, 137, 'C', 'pending', 0, NULL),
(215, 24, 138, '98', 'pending', 0, NULL),
(216, 24, 139, '01 ha 04 a 33 ca', 'pending', 0, NULL),
(269, 24, 140, '', 'pending', 0, NULL),
(275, 24, 141, '', 'pending', 0, NULL),
(278, 24, 142, '', 'pending', 0, NULL),
(279, 24, 143, '', 'pending', 0, NULL),
(280, 24, 144, '', 'pending', 0, NULL),
(281, 24, 145, '', 'pending', 0, NULL),
(1670, 33, 24, 'Nieuw Pand, Onbekende Straat 1', 'unverified', 0, NULL),
(1671, 33, 12, '', 'unverified', 0, NULL),
(1672, 33, 13, '', 'unverified', 0, NULL),
(1673, 33, 16, '', 'unverified', 0, NULL),
(1675, 33, 25, '', 'unverified', 0, NULL),
(1676, 33, 132, '', 'unverified', 0, NULL),
(1677, 33, 135, '', 'unverified', 0, NULL),
(1678, 33, 137, '', 'unverified', 0, NULL),
(1679, 33, 138, '', 'unverified', 0, NULL),
(1680, 33, 139, '', 'unverified', 0, NULL),
(1681, 33, 146, '', 'unverified', 0, NULL),
(1682, 33, 147, '', 'unverified', 0, NULL),
(1683, 33, 148, '', 'unverified', 0, NULL),
(1684, 33, 149, '', 'unverified', 0, NULL),
(1685, 33, 44, '', 'unverified', 0, NULL),
(1686, 33, 51, '', 'unverified', 0, NULL),
(1687, 33, 150, '', 'unverified', 0, NULL),
(1688, 33, 151, '', 'unverified', 0, NULL),
(1689, 33, 78, '', 'unverified', 0, NULL),
(1690, 33, 80, '', 'unverified', 0, NULL),
(1691, 33, 152, '', 'unverified', 0, NULL),
(1692, 33, 153, '', 'unverified', 0, NULL),
(1693, 33, 86, '', 'unverified', 0, NULL),
(1694, 33, 77, '', 'unverified', 0, NULL),
(1695, 33, 91, '', 'unverified', 0, NULL),
(1696, 33, 154, '', 'unverified', 0, NULL),
(1697, 33, 52, '', 'unverified', 0, NULL),
(1698, 33, 59, '', 'unverified', 0, NULL),
(1699, 33, 60, '', 'unverified', 0, NULL),
(1700, 33, 87, '', 'unverified', 0, NULL),
(1701, 33, 88, '', 'unverified', 0, NULL),
(1702, 33, 89, '', 'unverified', 0, NULL),
(1703, 33, 142, '', 'unverified', 0, NULL),
(1704, 33, 155, '', 'unverified', 0, NULL),
(1705, 33, 156, '', 'unverified', 0, NULL),
(1706, 33, 157, '', 'unverified', 0, NULL),
(1707, 33, 141, '', 'unverified', 0, NULL),
(1708, 33, 158, '', 'unverified', 0, NULL),
(1709, 33, 115, '', 'unverified', 0, NULL),
(1710, 33, 92, '', 'unverified', 0, NULL),
(1711, 33, 93, '', 'unverified', 0, NULL),
(1712, 33, 159, '', 'unverified', 0, NULL),
(1812, 35, 24, 'Nieuw Pand, Onbekende Straat 1', 'unverified', 0, NULL),
(1813, 36, 24, 'Kegelslei', 'unverified', 0, NULL),
(1814, 36, 12, 'Stéphane Joseph Henri', 'unverified', 0, NULL),
(1815, 36, 13, 'VERELST', 'unverified', 0, NULL),
(1816, 36, 14, 'Mechelen', 'unverified', 0, NULL),
(1817, 36, 15, '16 augustus 1964', 'unverified', 0, NULL),
(1818, 36, 16, 'Sint-Katelijne-Waver (Onze-Lieve-Vrouw-Waver), Waverlaan 2', 'unverified', 0, NULL),
(1819, 36, 17, 'An Maria Walter', 'unverified', 0, NULL),
(1820, 36, 18, 'VAN AS', 'unverified', 0, NULL),
(1821, 36, 19, 'Leuven', 'unverified', 0, NULL),
(1822, 36, 20, '21 januari 1976', 'unverified', 0, NULL),
(1823, 36, 21, 'Sint-Katelijne-Waver (Onze-Lieve-Vrouw-Waver), Waverlaan 2', 'unverified', 0, NULL),
(1824, 36, 22, 'Gehuwd onder het beheer van de scheiding van goederen met beperkte gemeenschap', 'unverified', 0, NULL),
(1826, 36, 25, 'SINT-KATELIJNE-WAVER', 'unverified', 0, NULL),
(1827, 36, 26, 'ONZE-LIEVE-VROUW-WAVER', 'unverified', 0, NULL),
(1828, 36, 51, 'agrarisch gebied bestemd voor de landbouw', 'unverified', 0, NULL),
(1829, 36, 52, '24.500,00 EUR', 'unverified', 0, NULL),
(1830, 36, 59, '2.450,00 EUR', 'unverified', 0, NULL),
(1831, 36, 60, '230-0122700-15', 'unverified', 0, NULL),
(1832, 36, 61, 'notaris André Costa', 'unverified', 0, NULL),
(1833, 36, 80, 'hetzij dat voor het betrokken goed geen gegevens beschikbaar zijn;\n• hetzij dat voor het betrokken goed geen bodemverontreiniging werd vastgesteld \ndie de bodemsaneringsnormen overschrijdt of dreigt te overschrijden, of die een \nernstige bedreiging vormt.', 'unverified', 0, NULL),
(1834, 36, 87, 'Dijk 34 te 2861 Onze-Lieve-Vrouw-Waver', 'unverified', 0, NULL),
(1835, 36, 89, 'binnen de drie maand vanaf de vervulling van nagemelde opschortende voorwaarden.', 'unverified', 0, NULL),
(1836, 36, 92, 'Sint-Katelijne-Waver (Onze-Lieve-Vrouw-Waver)', 'unverified', 0, NULL),
(1837, 36, 93, '26 februari 2003', 'unverified', 0, NULL),
(1838, 36, 112, 'een som gelijk aan tien ten honderd van de verkoopprijs', 'unverified', 0, NULL),
(1839, 36, 119, 'Jeu Alfons', 'unverified', 0, NULL),
(1840, 36, 132, 'Jeu Alfons LENS', 'unverified', 0, NULL),
(1841, 36, 133, 'Onze-Lieve-Vrouw-Waver', 'unverified', 0, NULL),
(1842, 36, 134, '17 juni 1931', 'unverified', 0, NULL),
(1843, 36, 135, 'Schaben, Wordenfreinstienen 4/2', 'unverified', 0, NULL),
(1844, 36, 136, 'Een perceel landbouwgrond met bunker, gelegen aan de Kegelslei', 'unverified', 0, NULL),
(1845, 36, 137, 'C', 'unverified', 0, NULL),
(1846, 36, 138, '98', 'unverified', 0, NULL),
(1847, 36, 139, 'één hectare vier are drieëndertig centiare (01 ha 04 a 33 ca)', 'unverified', 0, NULL),
(1848, 36, 140, 'gewestplan Mechelen', 'unverified', 0, NULL),
(1849, 36, 141, '10 %', 'unverified', 0, NULL),
(1850, 36, 142, 'André Costa', 'unverified', 0, NULL),
(1851, 36, 143, 'binnen de maand te rekenen vanaf heden', 'unverified', 0, NULL),
(1852, 36, 144, 'honderddrieëntwintigduizend negenhonderdzesenveertig euro zesenzeventig cent', 'unverified', 0, NULL),
(1853, 36, 145, 'vier', 'unverified', 0, NULL),
(1854, 36, 155, 'Dijk 34 te 2861 Onze-Lieve-Vrouw-Waver', 'unverified', 0, NULL),
(1901, 36, 146, '', 'unverified', 0, NULL),
(1902, 36, 147, '', 'unverified', 0, NULL),
(1903, 36, 148, '', 'unverified', 0, NULL),
(1904, 36, 149, '', 'unverified', 0, NULL),
(1905, 36, 44, '', 'unverified', 0, NULL),
(1907, 36, 150, '', 'unverified', 0, NULL),
(1908, 36, 151, '', 'unverified', 0, NULL),
(1909, 36, 78, '', 'unverified', 0, NULL),
(1911, 36, 152, '', 'unverified', 0, NULL),
(1912, 36, 153, '', 'unverified', 0, NULL),
(1913, 36, 86, '', 'unverified', 0, NULL),
(1914, 36, 77, '', 'unverified', 0, NULL),
(1915, 36, 91, '', 'unverified', 0, NULL),
(1916, 36, 154, '', 'unverified', 0, NULL),
(1921, 36, 88, '', 'unverified', 0, NULL),
(1925, 36, 156, '', 'unverified', 0, NULL),
(1926, 36, 157, '', 'unverified', 0, NULL),
(1928, 36, 158, '', 'unverified', 0, NULL),
(1929, 36, 115, '', 'unverified', 0, NULL),
(1932, 36, 159, '', 'unverified', 0, NULL);

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `AangepasteSectie`
--

CREATE TABLE `AangepasteSectie` (
  `aangepaste_sectie_id` int NOT NULL,
  `versie_id` int NOT NULL,
  `sectie_id` int NOT NULL,
  `tekst_inhoud` text,
  `validatiestatus` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Gegevens worden geëxporteerd voor tabel `AangepasteSectie`
--

INSERT INTO `AangepasteSectie` (`aangepaste_sectie_id`, `versie_id`, `sectie_id`, `tekst_inhoud`, `validatiestatus`) VALUES
(336, 31, 284, 'DE ONDERGETEKENDEN:\n1. De heer [placeholder:seller1_full_name], geboren te [placeholder:seller1_birthplace] op [placeholder:seller1_birthdate], wonende te [placeholder:seller1_address]. Hierna gezamenlijk genoemd “de verkoper”.\n2. De heer [placeholder:buyer1_lastname] [placeholder:buyer1_firstname], geboren te [placeholder:buyer1_birthplace] op [placeholder:buyer1_birthdate], en zijn echtgenote mevrouw [placeholder:buyer2_lastname] [placeholder:buyer2_firstname], geboren te [placeholder:buyer2_birthplace] op [placeholder:buyer2_birthdate], samenwonende te [placeholder:buyer1_address]. Gehuwd onder het beheer van de [placeholder:buyers_marital_status]. Hierna gezamenlijk genoemd “de koper”.\nZIJN OVEREENGEKOMEN WAT VOLGT:\nDe verkoper verklaart – onder cumulatieve vervulling van nagemelde opschortende voorwaarde – te verkopen, af te staan en over te dragen aan de koper, die aanvaardt – ieder tot beloop van de onverdeelde helft in volle eigendom – het hierna omschreven onroerend goed en dit onder de gewone waarborgen van daad en van recht, en voor vrij, zuiver en onbelast van alle voorrechten, hypotheken, bezwarende overschrijvingen of kantmeldingen en alle welkdanige lasten of schulden. De verkoper verklaart exclusief en voor de geheelheid in volle eigendom eigenaar te zijn van nagemeld onroerend goed en niet reeds eerder dit te hebben verkocht aan een derde, hetzij mondeling hetzij bij geschrift dat tot op heden niet werd ontbonden of nietig verklaard, op welke wijze ook. Verder verklaart de verkoper dat met betrekking tot nagemeld onroerend goed:\n• er hem geen besluit tot onteigening of geen voornemen tot opeising is bekend;\n• er geen recht van voorkoop en/of wederinkoop en/of optie bestaat, noch door hem een voorkeurrecht tot aankoop werd verleend in voordeel van een derde, behoudens datgene hierna uitdrukkelijk vermeld;\n• dat dit niet het voorwerp uitmaakt van het wettelijk recht van voorkoop ingesteld door de wet van de landpacht en/of valt onder toepassing van de wet op de ruilverkaveling en/of het decreet op het natuurbehoud en het natuurlijk milieu.', 'pending'),
(337, 31, 285, 'Gemeente [placeholder:property_municipality1] – 3e afdeling, voorheen [placeholder:property_municipality2]: Een [placeholder:property_detailed_description], gekadastreerd sectie [placeholder:property_cadastral_section] nr. [placeholder:property_cadastral_number], groot volgens titel [placeholder:property_cadastral_surface]. Hierna kortweg omschreven als “het goed” of “voorschreven goed”.', 'pending'),
(338, 31, 286, '', 'pending'),
(339, 31, 287, 'Het goed wordt verkocht in de staat waarin het zich thans bevindt en onder meer:\n• zonder waarborg van maat en oppervlakte, al bedragen de verschillen één/twintigste of meer;\n• met alle voor- en nadelige erfdienstbaarheden;\n• met alle zichtbare en verborgen gebreken, zonder vrijwaring dezer;\n• met alle gemeenschappen.\nDe verkoper verklaart geen weet te hebben van het bestaan van erfdienstbaarheden en er zelf geen te hebben toegestaan.', 'pending'),
(340, 31, 288, 'De koper treedt in het recht van eigendom van het voorschreven goed te rekenen vanaf de ondertekening van de notariële koop-verkoopakte en zal er ook te rekenen vanaf dan alle openbare lasten, gemeentelijke en andere belastingen en taksen van dragen en betalen. Niet-vervallen annuïteiten van verhaalbelastingen en andere gemeentelijke taksen of belastingen zijn voor rekening van de koper vanaf zelfde datum. De verkoper verklaart dat er naar zijn weten thans geen verhaalbelastingen verschuldigd zijn noch betekend werden. De verkoper verklaart tevens dat het goed, noch geheel noch gedeeltelijk, is onderworpen aan het wettelijk recht van voorkoop ingesteld door de wet op de landpacht. De koper zal het genot hebben van voorschreven onroerend goed door de vrije beschikking en effectieve inbezitname vanaf de ondertekening van de notariële koop-verkoopakte en de volledige betaling van de verkoopprijs.', 'pending'),
(341, 31, 289, 'Alle kosten, rechten en erelonen waartoe deze verkoop kan aanleiding geven, zijn ten laste van de koper, evenals de eventuele opmetingskosten.', 'pending'),
(342, 31, 290, 'In geval van bouwen zal de koper zich moeten onderwerpen aan de beslissingen en reglementen van de bevoegde instanties. Om te voldoen aan de voorschriften van het “decreet houdende de organisatie van de ruimtelijke ordening” wordt er verklaard door de verkoper dat voor het niet-bebouwde gedeelte geen bouw-, verkavelings- en stedenbouwkundige vergunning werd afgeleverd, en behoudens overlegging van een stedenbouwkundige vergunning die laat voorzien dat een dergelijke vergunning zou kunnen worden verkregen, de verkoper geen verzekering geeft wat de mogelijkheid betreft om op dit gedeelte van het goed te bouwen of daarop enige vaste of verplaatsbare inrichting op te stellen die voor bewoning kan worden gebruikt, noch enige verzekering wordt door de verkoper gegeven om de bestaande constructies te verbouwen. Artikel 99 van het decreet houdende de organisatie van de ruimtelijke ordening luidt letterlijk als volgt: “§1. Niemand mag zonder voorafgaande stedenbouwkundige vergunning:\n\n1. bouwen, op een grond één of meer vaste inrichtingen plaatsen, een bestaande vaste inrichting of bestaand bouwwerk afbreken, herbouwen, verbouwen of uitbreiden, met uitzondering van instandhoudings- of onderhoudswerken;\n\n2. ontbossen in de zin van het bosdecreet van 13 juni 1990 van alle met bomen begroeide oppervlakten bedoeld in artikel 3, §1 en §2 van dat decreet;\n\n3. hoogstammige bomen vellen, alleenstaand, in groeps- of lijnverband, voorzover ze geen deel uitmaken van met bomen begroeide oppervlakten in de zin van artikel 3, §1 en §2, van het bosdecreet van 13 juni 1990;\n\n4. het reliëf van de bodem aanmerkelijk wijzigen;\n\n5. een grond gewoonlijk gebruiken, aanleggen of inrichten voor:\n\n6. het opslaan van gebruikte of afgedankte voertuigen, van allerhande materialen, materieel of afval;\n\n7. het parkeren van voertuigen, wagens of aanhangwagens;\n\n8. het plaatsen van één of meer verplaatsbare inrichtingen die voor bewoning kunnen worden gebruikt, zoals woonwagens, kampeerwagens, afgedankte voertuigen, tenten;\n\n9. het plaatsen van één of meer verplaatsbare inrichtingen of rollend materieel die hoofdzakelijk voor publicitaire doeleinden worden gebruikt;\n\n10. het geheel of gedeeltelijk wijzigen van de hoofdfunctie van een onroerend bebouwd goed met het oog op een nieuwe functie, voorzover deze functiewijziging voorkomt op een door de Vlaamse regering op te stellen lijst van de vergunningsplichtige functiewijzigingen;\n\n11. in een gebouw het aantal woongelegenheden wijzigen die bestemd zijn voor de huisvesting van een gezin of een alleenstaande, ongeacht of het gaat om een eensgezinswoning, een etagewoning, een flatgebouw, een studio of een al dan niet gemeubileerde kamer;\n\n12. publiciteitsinrichtingen of uithangborden plaatsen of wijzigen;\n\n13. recreatieve terreinen aanleggen of wijzigen, waaronder een golfterrein, een voetbalterrein, een tennisveld, een zwembad.\n\nOnder bouwen en plaatsen van vaste inrichtingen, zoals bedoeld in het eerste lid, 1°, wordt verstaan het oprichten van een gebouw of een constructie of het plaatsen van een inrichting, zelfs uit niet-duurzame materialen, in de grond ingebouwd, aan de grond bevestigd of op de grond steunend omwille van de stabiliteit, en bestemd om ter plaatse te blijven staan, ook al kan het ook uit elkaar worden genomen, verplaatst of is het volledig ondergronds. Dit behelst ook het functioneel samenbrengen van materialen waardoor een vaste inrichting of constructie ontstaat, en het aanbrengen van verhardingen. Onder instandhoudings- of onderhoudswerken zoals bedoeld in het eerste lid, 1°, worden werken verstaan die het gebruik van het gebouw voor de toekomst ongewijzigd veiligstellen door het bijwerken, herstellen of vervangen van geërodeerde of versleten materialen of onderdelen. Hieronder kunnen geen werken begrepen worden die betrekking hebben op de constructieve elementen van het gebouw, zoals:\n\n14. vervangen van dakgebintes of dragende balken van het dak, met uitzondering van plaatselijke herstellingen;\n\n15. geheel of gedeeltelijk herbouwen of vervangen van buitenmuren, zelfs met recuperatie van de bestaande stenen.\n\nAls hoogstammige boom zoals bedoeld in het eerste lid, 3°, wordt beschouwd elke boom die op een hoogte van 1 meter boven het maaiveld een stamomtrek van 1 meter heeft. Als aanmerkelijke reliëfwijziging zoals bedoeld in het eerste lid, 4°, wordt onder meer beschouwd elke aanvulling, ophoging, uitgraving of uitdieping die de aard of functie van het terrein wijzigt. Onverminderd het eerste lid 5°, c, is geen stedenbouwkundige vergunning vereist voor het kamperen met verplaatsbare inrichtingen op een kampeerterrein in de zin van het decreet van 3 maart 1993 houdende het statuut van de terreinen voor openluchtrecreatieve verblijven. §2. De Vlaamse regering kan de lijst vaststellen van de werken, handelingen en wijzigingen waarvoor, wegens hun aard en/of omvang, in afwijking van §1, geen stedenbouwkundige vergunning vereist is. §3. Een provinciale en een gemeentelijke stedenbouwkundige verordening kunnen de vergunningsplichtige werken, handelingen en wijzigingen, genoemd in §1, aanvullen. Ze kunnen ook voor de met toepassing van §2 van vergunning vrijgestelde werken en handelingen de stedenbouwkundige vergunningsplicht invoeren.” Het bij deze verkochte goed is volgens het [placeholder:zoning_plan_name] gelegen in het [placeholder:zoning_destination] bestemd voor de landbouw.\n\n', 'pending'),
(343, 31, 291, 'a) De verkoper verklaart dat er op de grond, die het voorwerp is van onderhavige akte, bij zijn weten geen inrichting gevestigd is of was, of geen activiteit wordt of werd uitgevoerd die opgenomen is in de lijst van inrichtingen en activiteiten die bodemverontreiniging kunnen veroorzaken, zoals bedoeld in artikel 3, §1, van het Bodemsaneringsdecreet. b) De verkoper verklaart met betrekking tot het verkochte goed geen weet te hebben van bodemverontreiniging die schade kan berokkenen aan de koper of aan derden, of die aanleiding kan geven tot een saneringsverplichting, tot gebruiksbeperkingen of tot andere maatregelen die de overheid in dit verband kan opleggen. Voor zover voorgaande verklaring door de verkoper te goeder trouw afgelegd werd, neemt de koper de risico’s van eventuele bodemverontreiniging en de schade zowel als de kosten die daaruit kunnen voortvloeien op zich, en verklaart hij dat de verkoper hiervoor tot geen vrijwaring zal zijn gehouden.', 'pending'),
(344, 31, 292, 'In uitvoering van het decreet van 16 april 1996 inzake de bescherming van landschappen, verklaart de verkoper dat het bij deze verkochte goed niet gelegen is binnen een voorlopig beschermd landschap, en dat er geen maatregelen en/of richtlijnen zijn opgelegd met het oog op de instandhouding en het onderhoud van landschappen, noch erfdienstbaarheden van openbaar nut, en dat er geen beperkingen op de uitoefening van de eigendoms- en gebruiksrechten bestaan die van toepassing zijn op het bij deze verkochte goed. In uitvoering van het decreet van 3 maart 1976 verklaart de verkoper dat het goed niet opgenomen is in een lijst, noch voorontwerp of ontwerp van lijst van de voor bescherming vatbare monumenten, stads- en dorpsgezichten.', 'pending'),
(345, 31, 293, 'Deze verkoping is gedaan en aanvaard voor en mits de prijs van [placeholder:price_total]. De koper verbindt zich ertoe binnen de acht dagen vanaf heden als waarborg voor de stipte uitvoering van zijn verplichtingen een bedrag van [placeholder:deposit_amount] te storten op de bankrekeningnummer [placeholder:deposit_account] van nagenoemde notaris [placeholder:deposit_account_holder]. De notaris die deze gelden in bewaring krijgt, plaatst ze op een bijzondere rekening die hij opent op naam van de koper tot bij de ondertekening van de notariële koop-verkoopakte. Op dat ogenblik vormen deze gelden een voorschot op de prijs en dit tot beloop van het bedrag van de waarborg; de intresten van dit voorschot komen toe aan de verkoper behoudens in geval de verkoop niet kan doorgaan omwille van een niet aan de koper aan te rekenen fout of door overmacht. Het saldo van de verkoopprijs verbindt de koper zich te betalen bij de ondertekening van de notariële koop-verkoopakte. Ingeval van vertraging van de betaling zal de koper een verwijlvergoeding verschuldigd zijn aan de verkoper van tien frank ten honderd (10 %) ’s jaars op de nog verschuldigde koopprijs, behoudens wanneer deze vertraging te wijten is aan de verkoper. Deze verwijlvergoeding wordt berekend per dag vertraging en voor een jaar worden 365 dagen gerekend. Ingeval van niet-naleving door één van de partijen van de bij deze aangegane verbintenissen en na ingebrekestelling bij aangetekend schrijven of deurwaardersexploot, welk zonder gevolg gelaten werd gedurende een periode van vijftien dagen, zal deze verkoping van rechtswege ontbonden zijn. In dit geval zal een som gelijk aan [placeholder:contract_termination_penalty] van de verkoopprijs aan de niet-ingebreke gebleven partij toekomen ten titel van schadevergoeding. Partijen behouden zich nochtans het recht voor de gedwongen uitvoering van deze overeenkomst te vervolgen.', 'pending'),
(346, 31, 294, 'Partijen, die ervan kennis dragen dat ieder van hen het recht heeft zijn eigen notaris te kiezen – zonder verhoging van kosten –, stellen beiden aan notaris André Costa te [placeholder:notary_seller_office]. De notariële koop-verkoopakte dient verleden te worden op voorstel van de instrumenterende notaris binnen de [placeholder:notary_authentic_act_deadline] vanaf de vervulling van nagemelde opschortende voorwaarden.', 'pending'),
(347, 31, 295, 'Om te voldoen aan artikel 36 van het Vlaams Bodemsaneringsdecreet komen partijen overeen dat deze verkoop wordt gedaan onder de opschortende voorwaarde dat voor het bij deze verkochte goed door de Openbare Afvalstoffenmaatschappij van het Vlaams Gewest (OVAM) een bodemattest wordt afgeleverd waaruit blijkt:\n• hetzij dat voor het betrokken goed geen gegevens beschikbaar zijn;\n• hetzij dat voor het betrokken goed geen bodemverontreiniging werd vastgesteld die de bodemsaneringsnormen overschrijdt of dreigt te overschrijden, of die een ernstige bedreiging vormt.\nDe verkoper verbindt zich ertoe dit bodemattest zonder uitstel aan te vragen en de inhoud ervan mee te delen aan de koper binnen de maand te rekenen vanaf heden, onder voorbehoud echter dat zij het antwoord van OVAM ontvangen binnen de termijnen gesteld door voormeld decreet. De eigendom van het verkochte goed gaat, zoals hiervoren vermeld, over van de verkoper op de koper bij de ondertekening van de notariële koop-verkoopakte doch op voorwaarde en nadat koper op de hoogte gebracht is van de inhoud van voormeld bodemattest en voorzover dit bodemattest voldoet aan de hoger bepaalde voorwaarden. Indien de inhoud van dit attest aan de gestelde vereisten voldoet, zal hij geacht worden deel uit te maken van onderhavige verkoopovereenkomst.\nVerzekering in geval van overlijden bij ongeval van de koper: De koper erkent dat de notaris die de verkoopovereenkomst heeft opgesteld en waarvan de naam voorkomt, hem op de hoogte gebracht heeft van een ongevallenverzekering onderschreven bij de C.V.B.A. “Verzekeringen van het Notariaat” ingevolge een polis op naam van de notaris en waarvan de hoofdkenmerken hierna weergegeven worden:\n• de verzekering is kosteloos voor de koper;\n• verzekerd risico: overlijden door ongeval;\n• verzekerde personen: kopers natuurlijke personen;\n• verzekerd kapitaal: bedrag van de koopprijs vermeerderd met de kosten, rechten en erelonen van de overdracht, onder aftrek van de bedragen die reeds betaald werden voor dat het schadegeval zich voordeed en met uitsluiting van de bijkomende rechten en boeten als gevolg van een door het bestuur van de registratie vastgestelde meerwaarde evenals van de conventionele of moratoire intresten die zouden lopen na de datum van overlijden;\n• algemene beperking: honderddrieëntwintigduizend negenhonderdzesenveertig euro zesenzeventig cent per gebeurtenis die aanleiding geeft tot de waarborg, welk ook het aantal afgesloten verkoopovereenkomsten zij;\n• duur van de dekking: vanaf het ondertekenen van de verkoopovereenkomst tot aan de ondertekening van de authentieke akte van aankoop met een maximumduur van vier maanden na ondertekening van de verkoopovereenkomst of de verwezenlijking van de opschortende voorwaarden die in de verkoopvoorwaarden zouden voorkomen. De authentieke akte moet verleden worden binnen de vier maanden die op het overlijden volgen.', 'pending'),
(348, 31, 296, 'Opgemaakt in drie exemplaren, waarvan elke partij verklaart minstens één exemplaar te hebben ontvangen, te [placeholder:contract_place_of_signature] op [placeholder:contract_date_of_signature].\n\nGelever in goedgekeurd [handtekening] Gelezen en goedgekeurd [handtekening] Gelesen en goedgekeurd [handtekening]', 'pending'),
(363, 33, 311, 'DE ONDERGETEKENDEN:\n1. De heer [placeholder:seller1_full_name], geboren te [placeholder:seller1_birthplace] op [placeholder:seller1_birthdate], wonende te [placeholder:seller1_address]. Hierna gezamenlijk genoemd “de verkoper”.\n2. De heer [placeholder:buyer1_lastname] [placeholder:buyer1_firstname], geboren te [placeholder:buyer1_birthplace] op [placeholder:buyer1_birthdate], en zijn echtgenote mevrouw [placeholder:buyer2_lastname] [placeholder:buyer2_firstname], geboren te [placeholder:buyer2_birthplace] op [placeholder:buyer2_birthdate], samenwonende te [placeholder:buyer1_address]. Gehuwd onder het beheer van de [placeholder:buyers_marital_status]. Hierna gezamenlijk genoemd “de koper”.', 'pending'),
(364, 33, 312, 'De verkoper verklaart – onder cumulatieve vervulling van nagemelde opschortende voorwaarde – te verkopen, af te staan en over te dragen aan de koper, die aanvaardt – ieder tot beloop van de onverdeelde helft in volle eigendom – het hierna omschreven onroerend goed en dit onder de gewone waarborgen van daad en van recht, en voor vrij, zuiver en onbelast van alle voorrechten, hypotheken, bezwarende overschrijvingen of kantmeldingen en alle welkdanige lasten of schulden.\nDe verkoper verklaart exclusief en voor de geheelheid in volle eigendom eigenaar te zijn van nagemeld onroerend goed en niet reeds eerder dit te hebben verkocht aan een derde, hetzij mondeling hetzij bij geschrift dat tot op heden niet werd ontbonden of nietig verklaard, op welke wijze ook. Verder verklaart de verkoper dat met betrekking tot nagemeld onroerend goed:\n• er hem geen besluit tot onteigening of geen voornemen tot opeising is bekend;\n• er geen recht van voorkoop en/of wederinkoop en/of optie bestaat, noch door hem een voorkeurrecht tot aankoop werd verleend in voordeel van een derde, behoudens datgene hierna uitdrukkelijk vermeld;\n• dat dit niet het voorwerp uitmaakt van het wettelijk recht van voorkoop ingesteld door de wet van de landpacht en/of valt onder toepassing van de wet op de ruilverkaveling en/of het decreet op het natuurbehoud en het natuurlijk milieu.', 'pending'),
(365, 33, 313, 'Gemeente [placeholder:property_municipality1] – 3e afdeling, voorheen [placeholder:property_municipality2]: [placeholder:property_detailed_description], gelegen aan de Kegelslei, gekadastreerd sectie [placeholder:property_cadastral_section] nr. [placeholder:property_cadastral_number], groot volgens titel [placeholder:property_cadastral_surface]. Hierna kortweg omschreven als “het goed” of “voorschreven goed”.', 'pending'),
(366, 33, 314, '1° Toestand – Erfdienstbaarheden: Het goed wordt verkocht in de staat waarin het zich thans bevindt en onder meer:\n• zonder waarborg van maat en oppervlakte, al bedragen de verschillen één/twintigste of meer;\n• met alle voor- en nadelige erfdienstbaarheden;\n• met alle zichtbare en verborgen gebreken, zonder vrijwaring dezer;\n• met alle gemeenschappen.\nDe verkoper verklaart geen weet te hebben van het bestaan van erfdienstbaarheden en er zelf geen te hebben toegestaan.', 'pending'),
(367, 33, 315, 'De koper treedt in het recht van eigendom van het voorschreven goed te rekenen vanaf de ondertekening van de notariële koop-verkoopakte en zal er ook te rekenen vanaf dan alle openbare lasten, gemeentelijke en andere belastingen en taksen van dragen en betalen. Niet-vervallen annuïteiten van verhaalbelastingen en andere gemeentelijke taksen of belastingen zijn voor rekening van de koper vanaf zelfde datum.\nDe verkoper verklaart dat er naar zijn weten thans geen verhaalbelastingen verschuldigd zijn noch betekend werden.\nDe verkoper verklaart tevens dat het goed, noch geheel noch gedeeltelijk, is onderworpen aan het wettelijk recht van voorkoop ingesteld door de wet op de landpacht.\nDe koper zal het genot hebben van voorschreven onroerend goed door de vrije beschikking en effectieve inbezitname vanaf de ondertekening van de notariële koop-verkoopakte en de volledige betaling van de verkoopprijs.', 'pending'),
(368, 33, 316, 'Alle kosten, rechten en erelonen waartoe deze verkoop kan aanleiding geven, zijn ten laste van de koper, evenals de eventuele opmetingskosten.', 'pending'),
(369, 33, 317, 'In geval van bouwen zal de koper zich moeten onderwerpen aan de beslissingen en reglementen van de bevoegde instanties.\nOm te voldoen aan de voorschriften van het “decreet houdende de organisatie van de ruimtelijke ordening” wordt er verklaard door de verkoper dat voor het niet-bebouwde gedeelte geen bouw-, verkavelings- en stedenbouwkundige vergunning werd afgeleverd, en behoudens overlegging van een stedenbouwkundige vergunning die laat voorzien dat een dergelijke vergunning zou kunnen worden verkregen, de verkoper geen verzekering geeft wat de mogelijkheid betreft om op dit gedeelte van het goed te bouwen of daarop enige vaste of verplaatsbare inrichting op te stellen die voor bewoning kan worden gebruikt, noch enige verzekering wordt door de verkoper gegeven om de bestaande constructies te verbouwen.\nArtikel 99 van het decreet houdende de organisatie van de ruimtelijke ordening luidt letterlijk als volgt:\n“§1. Niemand mag zonder voorafgaande stedenbouwkundige vergunning:\n1° bouwen, op een grond één of meer vaste inrichtingen plaatsen, een bestaande vaste inrichting of bestaand bouwwerk afbreken, herbouwen, verbouwen of uitbreiden, met uitzondering van instandhoudings- of onderhoudswerken;\n2° ontbossen in de zin van het bosdecreet van 13 juni 1990 van alle met bomen begroeide oppervlakten bedoeld in artikel 3, §1 en §2 van dat decreet;\n3° hoogstammige bomen vellen, alleenstaand, in groeps- of lijnverband, voorzover ze geen deel uitmaken van met bomen begroeide oppervlakten in de zin van artikel 3, §1 en §2, van het bosdecreet van 13 juni 1990;\n4° het reliëf van de bodem aanmerkelijk wijzigen;\n5° een grond gewoonlijk gebruiken, aanleggen of inrichten voor:\na) het opslaan van gebruikte of afgedankte voertuigen, van allerhande materialen, materieel of afval; b) het parkeren van voertuigen, wagens of aanhangwagens; c) het plaatsen van één of meer verplaatsbare inrichtingen die voor bewoning kunnen worden gebruikt, zoals woonwagens, kampeerwagens, afgedankte voertuigen, tenten; d) het plaatsen van één of meer verplaatsbare inrichtingen of rollend materieel die hoofdzakelijk voor publicitaire doeleinden worden gebruikt;\n6° het geheel of gedeeltelijk wijzigen van de hoofdfunctie van een onroerend bebouwd goed met het oog op een nieuwe functie, voorzover deze functiewijziging voorkomt op een door de Vlaamse regering op te stellen lijst van de vergunningsplichtige functiewijzigingen;\n7° in een gebouw het aantal woongelegenheden wijzigen die bestemd zijn voor de huisvesting van een gezin of een alleenstaande, ongeacht of het gaat om een eensgezinswoning, een etagewoning, een flatgebouw, een studio of een al dan niet gemeubileerde kamer;\n8° publiciteitsinrichtingen of uithangborden plaatsen of wijzigen;\n9° recreatieve terreinen aanleggen of wijzigen, waaronder een golfterrein, een voetbalterrein, een tennisveld, een zwembad.\nOnder bouwen en plaatsen van vaste inrichtingen, zoals bedoeld in het eerste lid, 1°, wordt verstaan het oprichten van een gebouw of een constructie of het plaatsen van een inrichting, zelfs uit niet-duurzame materialen, in de grond ingebouwd, aan de grond bevestigd of op de grond steunend omwille van de stabiliteit, en bestemd om ter plaatse te blijven staan, ook al kan het ook uit elkaar worden genomen, verplaatst of is het volledig ondergronds. Dit behelst ook het functioneel samenbrengen van materialen waardoor een vaste inrichting of constructie ontstaat, en het aanbrengen van verhardingen.\nOnder instandhoudings- of onderhoudswerken zoals bedoeld in het eerste lid, 1°, worden werken verstaan die het gebruik van het gebouw voor de toekomst ongewijzigd veiligstellen door het bijwerken, herstellen of vervangen van geërodeerde of versleten materialen of onderdelen. Hieronder kunnen geen werken begrepen worden die betrekking hebben op de constructieve elementen van het gebouw, zoals:\n1° vervangen van dakgebintes of dragende balken van het dak, met uitzondering van plaatselijke herstellingen; 2° geheel of gedeeltelijk herbouwen of vervangen van buitenmuren, zelfs met recuperatie van de bestaande stenen.\nAls hoogstammige boom zoals bedoeld in het eerste lid, 3°, wordt beschouwd elke boom die op een hoogte van 1 meter boven het maaiveld een stamomtrek van 1 meter heeft.\nAls aanmerkelijke reliëfwijziging zoals bedoeld in het eerste lid, 4°, wordt onder meer beschouwd elke aanvulling, ophoging, uitgraving of uitdieping die de aard of functie van het terrein wijzigt. Onverminderd het eerste lid 5°, c, is geen stedenbouwkundige vergunning vereist voor het kamperen met verplaatsbare inrichtingen op een kampeerterrein in de zin van het decreet van 3 maart 1993 houdende het statuut van de terreinen voor openluchtrecreatieve verblijven.\n§2. De Vlaamse regering kan de lijst vaststellen van de werken, handelingen en wijzigingen waarvoor, wegens hun aard en/of omvang, in afwijking van §1, geen stedenbouwkundige vergunning vereist is.\n§3. Een provinciale en een gemeentelijke stedenbouwkundige verordening kunnen de vergunningsplichtige werken, handelingen en wijzigingen, genoemd in §1, aanvullen. Ze kunnen ook voor de met toepassing van §2 van vergunning vrijgestelde werken en handelingen de stedenbouwkundige vergunningsplicht invoeren.”\nHet bij deze verkochte goed is volgens het gewestplan [placeholder:zoning_regional_plan_name] gelegen in het [placeholder:zoning_destination].', 'pending'),
(370, 33, 318, 'a) De verkoper verklaart dat er op de grond, die het voorwerp is van onderhavige akte, bij zijn weten geen inrichting gevestigd is of was, of geen activiteit wordt of werd uitgevoerd die opgenomen is in de lijst van inrichtingen en activiteiten die bodemverontreiniging kunnen veroorzaken, zoals bedoeld in artikel 3, §1, van het Bodemsaneringsdecreet.\nb) De verkoper verklaart met betrekking tot het verkochte goed geen weet te hebben van bodemverontreiniging die schade kan berokkenen aan de koper of aan derden, of die aanleiding kan geven tot een saneringsverplichting, tot gebruiksbeperkingen of tot andere maatregelen die de overheid in dit verband kan opleggen.\nVoor zover voorgaande verklaring door de verkoper te goeder trouw afgelegd werd, neemt de koper de risico’s van eventuele bodemverontreiniging en de schade zowel als de kosten die daaruit kunnen voortvloeien op zich, en verklaart hij dat de verkoper hiervoor tot geen vrijwaring zal zijn gehouden.', 'pending'),
(371, 33, 319, 'In uitvoering van het decreet van 16 april 1996 inzake de bescherming van landschappen, verklaart de verkoper dat het bij deze verkochte goed niet gelegen is binnen een voorlopig beschermd landschap, en dat er geen maatregelen en/of richtlijnen zijn opgelegd met het oog op de instandhouding en het onderhoud van landschappen, noch erfdienstbaarheden van openbaar nut, en dat er geen beperkingen op de uitoefening van de eigendoms- en gebruiksrechten bestaan die van toepassing zijn op het bij deze verkochte goed.\nIn uitvoering van het decreet van 3 maart 1976 verklaart de verkoper dat het goed niet opgenomen is in een lijst, noch voorontwerp of ontwerp van lijst van de voor bescherming vatbare monumenten, stads- en dorpsgezichten.', 'pending'),
(372, 33, 320, 'Deze verkoping is gedaan en aanvaard voor en mits de prijs van [placeholder:price_total].\nDe koper verbindt zich ertoe binnen de acht dagen vanaf heden als waarborg voor de stipte uitvoering van zijn verplichtingen een bedrag van [placeholder:deposit_amount] te storten op de bankrekeningnummer [placeholder:deposit_account] van nagenoemde notaris [placeholder:deposit_account_holder]. De notaris die deze gelden in bewaring krijgt, plaatst ze op een bijzondere rekening die hij opent op naam van de koper tot bij de ondertekening van de notariële koop-verkoopakte. Op dat ogenblik vormen deze gelden een voorschot op de prijs en dit tot beloop van het bedrag van de waarborg; de intresten van dit voorschot komen toe aan de verkoper behoudens in geval de verkoop niet kan doorgaan omwille van een niet aan de koper aan te rekenen fout of door overmacht.\nHet saldo van de verkoopprijs verbindt de koper zich te betalen bij de ondertekening van de notariële koop-verkoopakte.\nIngeval van vertraging van de betaling zal de koper een verwijlvergoeding verschuldigd zijn aan de verkoper van [placeholder:delay_penalty_annual_rate] ’s jaars op de nog verschuldigde koopprijs, behoudens wanneer deze vertraging te wijten is aan de verkoper. Deze verwijlvergoeding wordt berekend per dag vertraging en voor een jaar worden 365 dagen gerekend.\nIngeval van niet-naleving door één van de partijen van de bij deze aangegane verbintenissen en na ingebrekestelling bij aangetekend schrijven of deurwaardersexploot, welk zonder gevolg gelaten werd gedurende een periode van vijftien dagen, zal deze verkoping van rechtswege ontbonden zijn. In dit geval zal een som gelijk aan [placeholder:contract_termination_penalty] van de verkoopprijs aan de niet-ingebreke gebleven partij toekomen ten titel van schadevergoeding.\nPartijen behouden zich nochtans het recht voor de gedwongen uitvoering van deze overeenkomst te vervolgen.', 'pending'),
(373, 33, 321, 'Partijen, die ervan kennis dragen dat ieder van hen het recht heeft zijn eigen notaris te kiezen – zonder verhoging van kosten –, stellen beiden aan notaris [placeholder:notary_name] te [placeholder:notary_seller_office].\nDe notariële koop-verkoopakte dient verleden te worden op voorstel van de instrumenterende notaris binnen de [placeholder:notary_authentic_act_deadline] vanaf de vervulling van nagemelde opschortende voorwaarden.', 'pending'),
(374, 33, 322, 'Om te voldoen aan artikel 36 van het Vlaams Bodemsaneringsdecreet komen partijen overeen dat deze verkoop wordt gedaan onder de opschortende voorwaarde dat voor het bij deze verkochte goed door de Openbare Afvalstoffenmaatschappij van het Vlaams Gewest (OVAM) een bodemattest wordt afgeleverd waaruit blijkt:\n• hetzij dat voor het betrokken goed geen gegevens beschikbaar zijn;\n• hetzij dat voor het betrokken goed geen bodemverontreiniging werd vastgesteld die de bodemsaneringsnormen overschrijdt of dreigt te overschrijden, of die een ernstige bedreiging vormt.\nDe verkoper verbindt zich ertoe dit bodemattest zonder uitstel aan te vragen en de inhoud ervan mee te delen aan de koper binnen de [placeholder:ovam_attest_communication_deadline] te rekenen vanaf heden, onder voorbehoud echter dat zij het antwoord van OVAM ontvangen binnen de termijnen gesteld door voormeld decreet.\nDe eigendom van het verkochte goed gaat, zoals hiervoren vermeld, over van de verkoper op de koper bij de ondertekening van de notariële koop-verkoopakte doch op voorwaarde en nadat koper op de hoogte gebracht is van de inhoud van voormeld bodemattest en voorzover dit bodemattest voldoet aan de hoger bepaalde voorwaarden. Indien de inhoud van dit attest aan de gestelde vereisten voldoet, zal hij geacht worden deel uit te maken van onderhavige verkoopovereenkomst.', 'pending'),
(375, 33, 323, 'De koper erkent dat de notaris die de verkoopovereenkomst heeft opgesteld en waarvan de naam voorkomt, hem op de hoogte gebracht heeft van een ongevallenverzekering onderschreven bij de C.V.B.A. “Verzekeringen van het Notariaat” ingevolge een polis op naam van de notaris en waarvan de hoofdkenmerken hierna weergegeven worden:\n• de verzekering is kosteloos voor de koper;\n• verzekerd risico: overlijden door ongeval;\n• verzekerde personen: kopers natuurlijke personen;\n• verzekerd kapitaal: bedrag van de koopprijs vermeerderd met de kosten, rechten en erelonen van de overdracht, onder aftrek van de bedragen die reeds betaald werden voor dat het schadegeval zich voordeed en met uitsluiting van de bijkomende rechten en boeten als gevolg van een door het bestuur van de registratie vastgestelde meerwaarde evenals van de conventionele of moratoire intresten die zouden lopen na de datum van overlijden;\n• algemene beperking: [placeholder:insurance_limit_per_event] per gebeurtenis die aanleiding geeft tot de waarborg, welk ook het aantal afgesloten verkoopovereenkomsten zij;\n• duur van de dekking: vanaf het ondertekenen van de verkoopovereenkomst tot aan de ondertekening van de authentieke akte van aankoop met een maximumduur van [placeholder:insurance_max_duration_months] na ondertekening van de verkoopovereenkomst of de verwezenlijking van de opschortende voorwaarden die in de verkoopvoorwaarden zouden voorkomen. De authentieke akte moet verleden worden binnen de vier maanden die op het overlijden volgen.', 'pending'),
(376, 33, 324, 'Opgemaakt in drie exemplaren, waarvan elke partij verklaart minstens één exemplaar te hebben ontvangen, te [placeholder:contract_place_of_signature] op [placeholder:contract_date_of_signature].\nGelever in goedgekeurd [handtekening] Gelezen en goedgekeurd [handtekening]\nGelesen en goedgekeurd [handtekening]', 'pending'),
(480, 41, 333, 'KOOP-VERKOOPOVEREENKOMST VOOR EEN WONING. Ondergetekenden :\nA. “De verkoper” (naam, voornamen, beroep, adres, btw-nummer):\n[placeholder:seller1_full_name]\n[placeholder:seller1_address]\nB. “De koper” (naam, voornamen, beroep, adres, btw-nummer):\n[placeholder:buyer1_firstname] [placeholder:buyer1_lastname]\n[placeholder:buyer1_address]\nhebben de volgende overeenkomst gesloten. De verkoper verkoopt aan de koper, die aanvaardt, de hierna beschreven woning:\nGemeente : [placeholder:property_municipality1]\nStraat en nummer: [placeholder:property_address]\nHet verkochte goed blijkt gekadastreerd te zijn sectie [placeholder:property_cadastral_section]\nnummer [placeholder:property_cadastral_number] en heeft een oppervlakte van [placeholder:property_cadastral_surface]\nHet niet-geïndexeerde kadastraal inkomen bedraagt € [placeholder:property_cadastral_income]', 'pending'),
(481, 41, 334, '', 'pending'),
(482, 41, 335, 'De verkoop is gesloten door het ondertekenen van onderhavige overeenkomst, onder het enige voorbehoud van de hierna genoemde opschortende voorwaarde(n). De koper zal evenwel slechts de eigendom van het goed verkrijgen door het ondertekenen van de notariële akte.', 'pending'),
(483, 41, 336, 'Het goed wordt voor vrij en onbelast verkocht. De verkoop wordt echter gesloten onder de opschortende voorwaarde dat, ingeval de prijs betaald in handen van de notaris onvoldoende zou zijn om op de dag van het verlijden van de notariële akte de hypothecaire schuldeisers of beslagleggers te voldoen, deze hun toestemming verlenen tot doorhaling van hun inschrijvingen of overschrijvingen. Alleen de koper zal de niet-verwezenlijking van deze voorwaarde kunnen inroepen.', 'pending'),
(484, 41, 337, 'Het goed wordt verkocht met alle lasten, erfdienstbaarheden en gemeenschappen die bestaan in het voordeel of ten laste van het goed. In dat verband:\n(hetzij) (1) verklaart de verkoper dat er bij zijn weten geen bestaan en dat ook zijn eigendomstitel geen bijzondere erfdienstbaarheden noch voorwaarden vermeldt waardoor de waarde of het genot van het goed zou kunnen worden beïnvloed.\n(hetzij) (1) erkent de koper dat hij een kopie van de eigendomstitel heeft ontvangen en dat hij in de plaats wordt gesteld van de verkoper in alle rechten en plichten die daaruit voortvloeien.\nDe verkoper verklaart dat hij zelf geen enkele erfdienstbaarheid heeft toegestaan.', 'pending'),
(485, 41, 338, 'Het goed wordt verkocht onder de gewone waarborgen. Het moet worden geleverd in de staat waarin het zich thans bevindt.\n(hetzij) 1 In geval van verborgen gebreken beschikt de koper over een verhaalmogelijkheid.\n(hetzij) 1 In geval van verborgen gebreken kan de koper geen enkel verhaal uitoefenen tegen de verkoper.\n(1 De alinea schrappen die niet van toepassing is; zonder schrapping is de eerste alinea van toepassing.)', 'pending'),
(486, 41, 339, 'De verkoper verklaart dat het verkochte goed voldoende verzekerd is tegen brandgevaar en daarmee samenhangende risico’s en verbindt zich ertoe dezelfde verzekering aan te houden tot aan het ondertekenen van de notariële akte.', 'pending'),
(487, 41, 340, 'De koper zal het genot hebben van het verkochte goed vanaf de dag van de ondertekening van de notariële akte.\n(hetzij) 2 Het verkochte goed zal vrij van gebruik zijn uiterlijk bij de ondertekening van de notariële akte.\n(hetzij) 2 Het verkochte goed wordt thans verhuurd als [placeholder:lease_type] tegen een maandelijkse huurprijs van € [placeholder:lease_monthly_price], sinds [placeholder:lease_start_date], krachtens een schriftelijke / mondelinge 2 huurovereenkomst.\nIndien het om een schriftelijke huurovereenkomst gaat, wordt een kopie van de overeenkomst en van de eventuele bijvoegsels geparafeerd door de koper en de verkoper en gehecht aan onderhavige overeenkomst. Indien de schriftelijke huurovereenkomst en de eventuele bijvoegsels niet worden aangehecht, kan de koper, binnen vijftien dagen nadat de huurovereenkomst hem door de verkoper werd overhandigd, de nietigheid van de koop aanvoeren bij gebrek aan akkoord over een van de essentiële elementen ervan.\nIngeval een huurwaarborg werd gegeven, verbindt de verkoper zich ertoe om uiterlijk bij het verlijden van de notariële akte het voordeel ervan over te dragen aan de koper.\n(2 Schrappen wat niet past)', 'pending'),
(488, 41, 341, 'Vanaf de datum van de ingenottreding is de koper alle belastingen, lasten en taksen verschuldigd, met uitzondering van de nog niet vervallen verhaalbelastingen. De verkoper verbindt er zich toe die voor de ondertekening van de notariële akte te betalen.', 'pending'),
(489, 41, 342, 'De verkoper verklaart dat er voor de oprichting van / de verbouwingen aan het goed 1:\n(hetzij) 1 een stedenbouwkundige vergunning werd uitgereikt op [placeholder:building_permit_date]\n(hetzij) 1 geen stedenbouwkundige vergunning beschikbaar is.\nDe verkoper verklaart dat bij gebrek aan een stedenbouwkundige vergunning of stedenbouwkundig attest dat laat uitschijnen dat een dergelijke vergunning zou kunnen worden verkregen, hij geen enkele verbintenis op zich neemt betreffende de mogelijkheid om op het verkochte goed enige handeling of werken uit te voeren (met inbegrip van de gebruikswijziging van het gebouw) waarvan sprake in de wetgeving op de ruimtelijke ordening en stedenbouw van toepassing op het verkochte goed.\nDe verkoper verklaart dat:\n(hetzij) 1 een verkavelingsvergunning werd uitgereikt op [placeholder:subdivision_permit_date]\n(hetzij) 1 voor zover hem bekend, de eigendom op heden niet het voorwerp uitmaakt van enig bouwmisdrijf noch van enige dagvaarding wegens inbreuk op de wetgeving op de ruimtelijke ordening en stedenbouw.\nDe verkoper verklaart dat dit de meest recente stedenbouwkundige bestemming van het verkochte goed is: [placeholder:zoning_destination]\nIndien het goed gelegen is in het Vlaams Gewest, verklaart de verkoper dat:\n– (hetzij) 1 een gevalideerd as-builtattest bestaat in de zin van artikel 4.2.1 van de Vlaamse Codex Ruimtelijke Ordening, waarvan een kopie wordt gehecht aan de koopovereenkomst.\n– (hetzij) 1 er geen gevalideerd as-builtattest bestaat.\n– (hetzij) 1 een recht van voorkoop bestaat ten voordele van [placeholder:right_of_first_refusal_beneficiary]\n– (hetzij) 1 er geen recht van voorkoop bestaat.\nTevens wordt in dat geval de aandacht gevestigd op de bepaling van artikel 4.2.1. van de Vlaamse Codex Ruimtelijke Ordening die opsomt welke werkzaamheden slechts mogen worden uitgevoerd na voorafgaande stedenbouwkundige vergunning.\nIndien het goed gelegen is in het Brussels Hoofdstedelijk Gewest, wordt de aandacht gevestigd op de bepaling van artikel 98, §1 van het Brussels Wetboek van Ruimtelijke Ordening die opsomt welke werkzaamheden slechts mogen worden uitgevoerd na voorafgaande stedenbouwkundige vergunning.\nIndien het goed gelegen is in het Waals Gewest, wordt de aandacht erop gevestigd dat, zonder stedenbouwkundige vergunning, geen van de bedoelde werkzaamheden of handelingen uit artikel 84, § 1 van de CWATUPE en, in voorkomend geval, artikel 84, § 2, eerste lid van de CWATUPE mag worden uitgevoerd.\n(1 Schrappen wat niet past)', 'pending'),
(490, 41, 343, 'De verkoper verklaart dat er, voor zover hij weet met betrekking tot het verkochte goed, geen procedure tot onteigening loopt of gepland is, noch enige voorlopige of definitieve maatregel is getroffen in het kader van de wetgeving op de ruimtelijke ordening en de stedenbouw, bescherming als monument, stads- of dorpsgezicht of als landschap; dat het goed geen deel uitmaakt van een bos in de zin van het Bosdecreet; dat er geen recht van voorkoop of wederinkoop bestaat en dat het goed niet het voorwerp is van een ondergrondse inneming.', 'pending'),
(491, 41, 344, 'Indien het goed gelegen is in het Vlaams Gewest, verklaart de verkoper dat hij vóór het sluiten van de overeenkomst een bodemattest heeft aangevraagd bij de OVAM en de inhoud ervan heeft meegedeeld aan de koper.\nDe inhoud van dat bodemattest, uitgereikt door de OVAM op [placeholder:ovam_attest_date], is de volgende: [placeholder:ovam_attest_pollution]\nDe verkoper bevestigt uitdrukkelijk er persoonlijk geen kennis van te hebben dat op het verkochte goed een inrichting is of was gevestigd en een activiteit wordt of werd uitgevoerd die opgenomen zijn in de lijst van de inrichtingen en activiteiten die bodemverontreiniging kunnen veroorzaken zoals bedoeld in het Bodemsaneringsdecreet.', 'pending'),
(492, 41, 345, 'Indien het goed gelegen is in het Brussels Hoofdstedelijk Gewest, verklaart de verkoper dat hij vóór het sluiten van de overeenkomst een bodemattest heeft aangevraagd bij het BIM en de inhoud ervan heeft meegedeeld aan de koper.\nDe inhoud van dat bodemattest, uitgereikt door het BIM op [placeholder:bim_attest_date], is de volgende: [placeholder:bim_attest_content]\nDe verkoper bevestigt uitdrukkelijk persoonlijk geen kennis te hebben van aanvullende informatie die de inhoud van het door het BIM uitgereikte bodemattest zou kunnen wijzigen.', 'pending'),
(493, 41, 346, '(hetzij) (1) De verkoper verklaart dat voor het verkochte goed volgens de wettelijke bepalingen geen postinterventiedossier dient te bestaan.\n(hetzij) (1) De verkoper verklaart dat voor het verkochte goed een postinterventiedossier vereist is. Dat dossier zal uiterlijk bij het verlijden van de notariële akte worden overgemaakt.\n(1) Schrappen wat niet past', 'pending'),
(494, 41, 347, '(hetzij) (1) Bij het verkochte goed hoort geen stookolietank.\n(hetzij) (1) Bij het verkochte goed hoort een stookolietank. In voorkomend geval is er een keurings- en/of conformiteitsattest.\n(1) Schrappen wat niet past', 'pending'),
(495, 41, 348, '(hetzij) (1) De koper verklaart in het bezit te zijn gesteld van de laatste twee periodieke reinigings- en verbrandingsattesten voor de centrale verwarming.\n(hetzij) 1 De verkoper zal uiterlijk bij het verlijden van de notariële akte de laatste twee periodieke reinigings- en verbrandingsattesten voor de centrale verwarming bezorgen.\n(1) Schrappen wat niet past', 'pending'),
(496, 41, 349, '(hetzij) 1 De verkoper legt een proces-verbaal van onderzoek van de bestaande huishoudelijke elektrische installatie voor, opgemaakt door een erkende controle-instelling op [placeholder:electricity_inspection_date]\n(hetzij) 1 De verkoper verklaart dat de installatie dateert van voor 1 oktober 1981 en nooit werd gekeurd. Hij verbindt er zich toe om op zijn kosten een controle te laten verrichten door een erkende instelling en het proces-verbaal vóór de ondertekening van de notariële akte te bezorgen aan de notaris van de koper.\n(hetzij) 1 De verkoper verklaart dat de installatie dateert van na 1 oktober 1981 en werd gekeurd en dat de keuring niet ouder is dan 25 jaar. Hij verbindt zich ertoe om het proces-verbaal vóór de ondertekening van de notariële akte te bezorgen aan de notaris van de koper.\nIndien de installatie niet voldoet, zal:\n(hetzij) 1 de koper voor zijn rekening de installatie binnen 18 maanden in orde maken en voor zijn rekening een nieuw controleonderzoek laten uitvoeren.\n(hetzij) 1 de verkoper voor zijn rekening de installatie binnen 18 maanden in orde maken en voor zijn rekening een nieuw controleonderzoek laten uitvoeren.\n(1 Schrappen wat niet past)', 'pending'),
(497, 41, 350, '(hetzij) 1 De verkoper verklaart dat een rookmelder werd aangebracht in de woning.\n(hetzij) 1 De verkoper verklaart dat geen rookmelder werd aangebracht in de woning.\n(1 Schrappen wat niet past)', 'pending'),
(498, 41, 351, 'Het energieprestatiecertificaat van de woning bevat de volgende gegevens m.b.t. de energieprestaties van de woning: [placeholder:epc_attest_score]', 'pending'),
(499, 41, 352, 'Ligt de woning in het Vlaams Gewest, dan verklaart de verkoper dat ze ligt / niet ligt 2 in:\n– een mogelijk of effectief overstromingsgevoelig gebied;\n– een afgebakend overstromingsgebied of een afgebakende oeverzone.\n(2 Schrappen wat niet past; zonder schrapping ligt het goed niet in een dergelijk gebied)', 'pending'),
(500, 41, 353, 'De koper wordt in de plaats gesteld van de verkoper in alle rechten die deze had kunnen inroepen of had ingeroepen in het raam van de tienjarige aansprakelijkheid van architecten en aannemers, mits de koper alle kosten die daaruit voortvloeien ten laste neemt.', 'pending'),
(501, 41, 354, '(hetzij) (1) Partijen komen overeen om een tegensprekelijke plaatsbeschrijving op te maken. Dat om bijvoorbeeld te voorkomen dat de koper die reeds vóór het verlijden van de notariële akte het genot verwerft, bepaalde schade zou aanrichten of om te voorkomen dat de verkoper vóór het verlijden van de notariële akte bepaalde goederen zou wegnemen. De kosten van de plaatsbeschrijving worden in gelijke delen verdeeld onder de partijen.\n(hetzij) 1 Er wordt geen plaatsbeschrijving opgemaakt.\n(1 Schrappen wat niet past)', 'pending');
INSERT INTO `AangepasteSectie` (`aangepaste_sectie_id`, `versie_id`, `sectie_id`, `tekst_inhoud`, `validatiestatus`) VALUES
(502, 41, 355, 'Het staat partijen vrij om in de bijzondere voorwaarden nog andere opschortende voorwaarden op te nemen dan die welke hierna wordt vermeld.\nToekenning van een hypothecair krediet\n(hetzij) 1 Onderhavige verkoop wordt niet gesloten onder de opschortende voorwaarde dat aan de koper een hypothecair krediet wordt toegestaan.\n(hetzij) 1 Onderhavige verkoop wordt gesloten onder de opschortende voorwaarde dat aan de koper een hypothecair krediet wordt toegestaan waarvan het bedrag niet hoger mag zijn dan [placeholder:contract_financing_percentage] % van de verkoopprijs 2, tegen de normale marktvoorwaarden voor een minimumduur van 15 jaar en zonder dat een bijkomende waarborg wordt geëist.\nDeze opschortende voorwaarde moet verwezenlijkt zijn binnen een termijn van [placeholder:contract_financing_clause_deadline] maanden 3 na de ondertekening van onderhavige overeenkomst.\nIndien het hypothecair krediet binnen die termijn wordt toegestaan, is de verkoop gesloten. Niettemin moet de koper de verkoper hiervan op de hoogte brengen met een aangetekend schrijven, verstuurd uiterlijk vóór het verstrijken van voormelde termijn. Zoniet heeft de verkoper recht op schadevergoeding indien hij schade kan aantonen.\nIndien het hypothecair krediet niet binnen die termijn werd verkregen, wordt de opschortende voorwaarde als niet verwezenlijkt beschouwd en is de verkoop onbestaande. De koper moet de verkoper hiervan verwittigen met een aangetekend schrijven. Het bedrag dat hij had betaald als waarborg of voorschot, moet dan aan hem worden terugbetaald, na aftrek van een vergoeding voor de tijdelijke onbeschikbaarheid van het goed.\nDie onbeschikbaarheidsvergoeding bedraagt:\n– in de veronderstelling dat de verkoper binnen de vooropgestelde termijn werd verwittigd: een half pro duizend van de bedongen prijs, per volledige dag tussen de datum van onderhavige overeenkomst en de datum waarop de aangetekende brief werd verstuurd binnen de termijn overeengekomen voor het verkrijgen van het krediet;\n– in de veronderstelling dat de verkoper pas na de vooropgestelde termijn werd verwittigd: één pro duizend van de bedongen prijs, per volledige dag tussen de vervaldag van de termijn overeengekomen voor het verkrijgen van het krediet en het versturen van de aangetekende brief die de verkoper op de hoogte brengt van het niet verkrijgen van het krediet.\nIndien de koper het bewijs niet levert van de weigering van het krediet of niet bewijst dat hij tijdig het nodige heeft ondernomen om een krediet te verkrijgen, heeft de verkoper, bij uitsluiting van elke andere schadevergoeding, recht op een forfaitaire schadevergoeding van 10 % van de verkoopprijs op voorwaarde dat hij de koper heeft aangemaand om de bewijzen te leveren en de koper hieraan geen gevolg heeft gegeven binnen 15 dagen na de aanmaning.\nDe koper kan eveneens verzaken aan huidige opschortende voorwaarde. Die verzaking is tegenstelbaar aan de verkoper op voorwaarde dat de koper hem hiervan op de hoogte bracht met een aangetekend schrijven verstuurd uiterlijk op de vervaldatum overeengekomen voor de verwezenlijking van de voorwaarde.\n(1 Schrappen wat niet past\n2 Tenzij hier een ander cijfer werd vermeld, gaat het om 100 % van de verkoopprijs\n3 Wordt de overeengekomen termijn niet opgegeven, dan bedraagt hij automatisch 2 maanden.)', 'pending'),
(503, 41, 356, 'Deze verkoop wordt toegestaan en aanvaard voor de prijs van € [placeholder:price_total], te betalen op volgende wijze:\n(hetzij) 1 De koper overhandigt aan de verkoper bij wijze van voorschot een cheque gewaarborgd of uitgeschreven door een bankinstelling ten belope van € [placeholder:deposit_amount]\n(hetzij) 1 De koper overhandigt aan de verkoper bij wijze van waarborg voor de stipte uitvoering van zijn verplichtingen een cheque gewaarborgd of uitgeschreven door een bankinstelling ten belope van € [placeholder:deposit_amount], op naam van de notaris van de verkoper. De notaris die deze gelden in bewaring krijgt, plaatst ze op een bijzondere rekening die hij opent op naam van de koper tot bij de ondertekening van de notariële akte. Op dat ogenblik vormen deze gelden een voorschot op de prijs en dat ten belope van het bedrag van de waarborg, los van de intresten die de verkoper toekomen. De intresten zijn gelijk aan de wettelijke intresten.\nHet saldo dient te worden betaald bij het verlijden van de notariële akte, door middel van een cheque gewaarborgd of uitgeschreven door een bankinstelling.\nDe koper betaalt het voorschot of de waarborg van het volgende rekeningnummer: [placeholder:deposit_account]\nKosten\nDe kosten en het ereloon van de notariële akte alsook de verschuldigde registratierechten vallen ten laste van de koper. De kosten voor opmeting, verricht op verzoek van de koper, vallen eveneens te zijnen laste.\n(1 De alinea schrappen die niet van toepassing is; zonder schrapping is de eerste alinea van toepassing)', 'pending'),
(504, 41, 357, 'Partijen verklaren te weten dat zij vrije keuze van notaris hebben, zonder dat dit enige kostenverhoging met zich meebrengt. Zij hebben voor het verlijden van de notariële akte aangesteld :\n(hetzij) 2 eenzelfde notaris, Meester [placeholder:notary_name], notaris te [placeholder:notary_office_address]\n(hetzij) 2\nvoor de verkoper: Meester [placeholder:notary_seller_name], notaris te [placeholder:notary_seller_office]\nvoor de koper: Meester [placeholder:notary_buyer_name], notaris te [placeholder:notary_buyer_office]\nDe partijen zullen uiterlijk op [placeholder:notary_authentic_act_deadline] voor de notaris verschijnen om over te gaan tot de ondertekening van de notariële akte.\n(2 Schrappen wat niet past)', 'pending'),
(505, 41, 358, '1. Indien de notariële akte niet is ondertekend op voormelde datum, kan elke partij binnen twee weken nadat ze de andere partij in gebreke heeft gesteld, per aangetekend schrijven of per deurwaardersexploot:\n– hetzij de gedwongen uitvoering van de verkoop in rechte vorderen;\n– hetzij de verkoop beschouwen als van rechtswege ontbonden.\nDe partij die in gebreke blijft, moet hoe dan ook als schadevergoeding een bedrag betalen dat forfaitair wordt vastgelegd op 10 % van de verkoopprijs. De benadeelde partij kan daarnaast ook het bewijs leveren dat zij meer schade heeft geleden. Daarenboven is de partij die in gebreke blijft, steeds verplicht om aan de wederpartij alle kosten te vergoeden.\n2. Indien de prijs of het saldo daarvan door toedoen van de koper op een latere datum wordt betaald dan de hierboven bepaalde uiterste datum voor het verlijden van de notariële akte, brengt de prijs of het saldo daarvan van rechtswege en zonder ingebrekestelling een intrest op van [placeholder:delay_penalty_annual_rate] procent per jaar. Die intrest wordt berekend vanaf de hierboven bepaalde uiterste datum tot op de datum van volledige betaling.\n(1 Indien het percentage niet werd ingevuld, wordt de wettelijke intrest aangerekend te vermeerderen met 2%.)', 'pending'),
(506, 41, 359, '[placeholder:contract_special_conditions]', 'pending'),
(507, 41, 360, 'Voor de uitvoering van onderhavige overeenkomst kiezen de partijen woonplaats op hun bovengenoemde adres en indien ze niet in België verblijven op het kantoor van de door hen aangewezen notaris.', 'pending'),
(508, 41, 361, 'Onderhavige verkoop is gesloten door bemiddeling van: [placeholder:contract_broker_name]', 'pending'),
(509, 41, 362, 'Opgemaakt te [placeholder:contract_place_of_signature] op [placeholder:contract_date_of_signature] in zoveel exemplaren als er partijen zijn.\nElke partij verklaart hierbij een exemplaar te hebben ontvangen.\nVoor ondertekening\nDe verkoper                           De koper\n(Gelieve elke bladzijde en elke eventuele schrapping te paraferen)', 'pending'),
(510, 41, 363, '- Kopie eigendomstitel\n- Bodemattest\n- Energieprestatiecertificaat\n- Stedenbouwkundige vergunning (eventueel)\n- Verkavelingsvergunning (eventueel)\n- As-builtattest (eventueel)\n- Keuringsattest stookolietank (eventueel)\n- Huurovereenkomst (eventueel)\n- Andere: [placeholder:annex_other_documents]', 'pending'),
(511, 41, 364, 'Deze overeenkomst werd opgemaakt door\nVerbruikersunie Test-Aankoop\nHollandstraat 13, 1060 Brussel\nKoninklijke Federatie van Belgische Notarissen\nBergstraat 30-32, 1000 Brussel\nVlaamse Vastgoedfederatie\nMozartstraat 24/11, 2018 Antwerpen\nUnie der Immobiliënberoepen van België\nAlbertlaan 29, 1190 Brussel\nConfederatie van Immobiliënberoepen van België\nWaterloosesteenweg 715/32, 1180 Brussel\nAangepast door Test-Aankoop\nin maart 2014', 'pending'),
(512, 44, 311, 'DE ONDERGETEKENDEN:\n1. De heer [placeholder:seller1_full_name], geboren te [placeholder:seller1_birthplace] op [placeholder:seller1_birthdate], wonende te [placeholder:seller1_address]. Hierna gezamenlijk genoemd “de verkoper”.\n2. De heer [placeholder:buyer1_lastname] [placeholder:buyer1_firstname], geboren te [placeholder:buyer1_birthplace] op [placeholder:buyer1_birthdate], en zijn echtgenote mevrouw [placeholder:buyer2_lastname] [placeholder:buyer2_firstname], geboren te [placeholder:buyer2_birthplace] op [placeholder:buyer2_birthdate], samenwonende te [placeholder:buyer1_address]. Gehuwd onder het beheer van de [placeholder:buyers_marital_status]. Hierna gezamenlijk genoemd “de koper”.', 'pending'),
(513, 44, 312, 'De verkoper verklaart – onder cumulatieve vervulling van nagemelde opschortende voorwaarde – te verkopen, af te staan en over te dragen aan de koper, die aanvaardt – ieder tot beloop van de onverdeelde helft in volle eigendom – het hierna omschreven onroerend goed en dit onder de gewone waarborgen van daad en van recht, en voor vrij, zuiver en onbelast van alle voorrechten, hypotheken, bezwarende overschrijvingen of kantmeldingen en alle welkdanige lasten of schulden.\nDe verkoper verklaart exclusief en voor de geheelheid in volle eigendom eigenaar te zijn van nagemeld onroerend goed en niet reeds eerder dit te hebben verkocht aan een derde, hetzij mondeling hetzij bij geschrift dat tot op heden niet werd ontbonden of nietig verklaard, op welke wijze ook. Verder verklaart de verkoper dat met betrekking tot nagemeld onroerend goed:\n• er hem geen besluit tot onteigening of geen voornemen tot opeising is bekend;\n• er geen recht van voorkoop en/of wederinkoop en/of optie bestaat, noch door hem een voorkeurrecht tot aankoop werd verleend in voordeel van een derde, behoudens datgene hierna uitdrukkelijk vermeld;\n• dat dit niet het voorwerp uitmaakt van het wettelijk recht van voorkoop ingesteld door de wet van de landpacht en/of valt onder toepassing van de wet op de ruilverkaveling en/of het decreet op het natuurbehoud en het natuurlijk milieu.', 'pending'),
(514, 44, 313, 'Gemeente [placeholder:property_municipality1] – 3e afdeling, voorheen [placeholder:property_municipality2]: [placeholder:property_detailed_description], gelegen aan de Kegelslei, gekadastreerd sectie [placeholder:property_cadastral_section] nr. [placeholder:property_cadastral_number], groot volgens titel [placeholder:property_cadastral_surface]. Hierna kortweg omschreven als “het goed” of “voorschreven goed”.', 'pending'),
(515, 44, 314, '1° Toestand – Erfdienstbaarheden: Het goed wordt verkocht in de staat waarin het zich thans bevindt en onder meer:\n• zonder waarborg van maat en oppervlakte, al bedragen de verschillen één/twintigste of meer;\n• met alle voor- en nadelige erfdienstbaarheden;\n• met alle zichtbare en verborgen gebreken, zonder vrijwaring dezer;\n• met alle gemeenschappen.\nDe verkoper verklaart geen weet te hebben van het bestaan van erfdienstbaarheden en er zelf geen te hebben toegestaan.', 'pending'),
(516, 44, 315, 'De koper treedt in het recht van eigendom van het voorschreven goed te rekenen vanaf de ondertekening van de notariële koop-verkoopakte en zal er ook te rekenen vanaf dan alle openbare lasten, gemeentelijke en andere belastingen en taksen van dragen en betalen. Niet-vervallen annuïteiten van verhaalbelastingen en andere gemeentelijke taksen of belastingen zijn voor rekening van de koper vanaf zelfde datum.\nDe verkoper verklaart dat er naar zijn weten thans geen verhaalbelastingen verschuldigd zijn noch betekend werden.\nDe verkoper verklaart tevens dat het goed, noch geheel noch gedeeltelijk, is onderworpen aan het wettelijk recht van voorkoop ingesteld door de wet op de landpacht.\nDe koper zal het genot hebben van voorschreven onroerend goed door de vrije beschikking en effectieve inbezitname vanaf de ondertekening van de notariële koop-verkoopakte en de volledige betaling van de verkoopprijs.', 'pending'),
(517, 44, 316, 'Alle kosten, rechten en erelonen waartoe deze verkoop kan aanleiding geven, zijn ten laste van de koper, evenals de eventuele opmetingskosten.', 'pending'),
(518, 44, 317, 'In geval van bouwen zal de koper zich moeten onderwerpen aan de beslissingen en reglementen van de bevoegde instanties.\nOm te voldoen aan de voorschriften van het “decreet houdende de organisatie van de ruimtelijke ordening” wordt er verklaard door de verkoper dat voor het niet-bebouwde gedeelte geen bouw-, verkavelings- en stedenbouwkundige vergunning werd afgeleverd, en behoudens overlegging van een stedenbouwkundige vergunning die laat voorzien dat een dergelijke vergunning zou kunnen worden verkregen, de verkoper geen verzekering geeft wat de mogelijkheid betreft om op dit gedeelte van het goed te bouwen of daarop enige vaste of verplaatsbare inrichting op te stellen die voor bewoning kan worden gebruikt, noch enige verzekering wordt door de verkoper gegeven om de bestaande constructies te verbouwen.\nArtikel 99 van het decreet houdende de organisatie van de ruimtelijke ordening luidt letterlijk als volgt:\n“§1. Niemand mag zonder voorafgaande stedenbouwkundige vergunning:\n1° bouwen, op een grond één of meer vaste inrichtingen plaatsen, een bestaande vaste inrichting of bestaand bouwwerk afbreken, herbouwen, verbouwen of uitbreiden, met uitzondering van instandhoudings- of onderhoudswerken;\n2° ontbossen in de zin van het bosdecreet van 13 juni 1990 van alle met bomen begroeide oppervlakten bedoeld in artikel 3, §1 en §2 van dat decreet;\n3° hoogstammige bomen vellen, alleenstaand, in groeps- of lijnverband, voorzover ze geen deel uitmaken van met bomen begroeide oppervlakten in de zin van artikel 3, §1 en §2, van het bosdecreet van 13 juni 1990;\n4° het reliëf van de bodem aanmerkelijk wijzigen;\n5° een grond gewoonlijk gebruiken, aanleggen of inrichten voor:\na) het opslaan van gebruikte of afgedankte voertuigen, van allerhande materialen, materieel of afval; b) het parkeren van voertuigen, wagens of aanhangwagens; c) het plaatsen van één of meer verplaatsbare inrichtingen die voor bewoning kunnen worden gebruikt, zoals woonwagens, kampeerwagens, afgedankte voertuigen, tenten; d) het plaatsen van één of meer verplaatsbare inrichtingen of rollend materieel die hoofdzakelijk voor publicitaire doeleinden worden gebruikt;\n6° het geheel of gedeeltelijk wijzigen van de hoofdfunctie van een onroerend bebouwd goed met het oog op een nieuwe functie, voorzover deze functiewijziging voorkomt op een door de Vlaamse regering op te stellen lijst van de vergunningsplichtige functiewijzigingen;\n7° in een gebouw het aantal woongelegenheden wijzigen die bestemd zijn voor de huisvesting van een gezin of een alleenstaande, ongeacht of het gaat om een eensgezinswoning, een etagewoning, een flatgebouw, een studio of een al dan niet gemeubileerde kamer;\n8° publiciteitsinrichtingen of uithangborden plaatsen of wijzigen;\n9° recreatieve terreinen aanleggen of wijzigen, waaronder een golfterrein, een voetbalterrein, een tennisveld, een zwembad.\nOnder bouwen en plaatsen van vaste inrichtingen, zoals bedoeld in het eerste lid, 1°, wordt verstaan het oprichten van een gebouw of een constructie of het plaatsen van een inrichting, zelfs uit niet-duurzame materialen, in de grond ingebouwd, aan de grond bevestigd of op de grond steunend omwille van de stabiliteit, en bestemd om ter plaatse te blijven staan, ook al kan het ook uit elkaar worden genomen, verplaatst of is het volledig ondergronds. Dit behelst ook het functioneel samenbrengen van materialen waardoor een vaste inrichting of constructie ontstaat, en het aanbrengen van verhardingen.\nOnder instandhoudings- of onderhoudswerken zoals bedoeld in het eerste lid, 1°, worden werken verstaan die het gebruik van het gebouw voor de toekomst ongewijzigd veiligstellen door het bijwerken, herstellen of vervangen van geërodeerde of versleten materialen of onderdelen. Hieronder kunnen geen werken begrepen worden die betrekking hebben op de constructieve elementen van het gebouw, zoals:\n1° vervangen van dakgebintes of dragende balken van het dak, met uitzondering van plaatselijke herstellingen; 2° geheel of gedeeltelijk herbouwen of vervangen van buitenmuren, zelfs met recuperatie van de bestaande stenen.\nAls hoogstammige boom zoals bedoeld in het eerste lid, 3°, wordt beschouwd elke boom die op een hoogte van 1 meter boven het maaiveld een stamomtrek van 1 meter heeft.\nAls aanmerkelijke reliëfwijziging zoals bedoeld in het eerste lid, 4°, wordt onder meer beschouwd elke aanvulling, ophoging, uitgraving of uitdieping die de aard of functie van het terrein wijzigt. Onverminderd het eerste lid 5°, c, is geen stedenbouwkundige vergunning vereist voor het kamperen met verplaatsbare inrichtingen op een kampeerterrein in de zin van het decreet van 3 maart 1993 houdende het statuut van de terreinen voor openluchtrecreatieve verblijven.\n§2. De Vlaamse regering kan de lijst vaststellen van de werken, handelingen en wijzigingen waarvoor, wegens hun aard en/of omvang, in afwijking van §1, geen stedenbouwkundige vergunning vereist is.\n§3. Een provinciale en een gemeentelijke stedenbouwkundige verordening kunnen de vergunningsplichtige werken, handelingen en wijzigingen, genoemd in §1, aanvullen. Ze kunnen ook voor de met toepassing van §2 van vergunning vrijgestelde werken en handelingen de stedenbouwkundige vergunningsplicht invoeren.”\nHet bij deze verkochte goed is volgens het gewestplan [placeholder:zoning_regional_plan_name] gelegen in het [placeholder:zoning_destination].', 'pending'),
(519, 44, 318, 'a) De verkoper verklaart dat er op de grond, die het voorwerp is van onderhavige akte, bij zijn weten geen inrichting gevestigd is of was, of geen activiteit wordt of werd uitgevoerd die opgenomen is in de lijst van inrichtingen en activiteiten die bodemverontreiniging kunnen veroorzaken, zoals bedoeld in artikel 3, §1, van het Bodemsaneringsdecreet.\nb) De verkoper verklaart met betrekking tot het verkochte goed geen weet te hebben van bodemverontreiniging die schade kan berokkenen aan de koper of aan derden, of die aanleiding kan geven tot een saneringsverplichting, tot gebruiksbeperkingen of tot andere maatregelen die de overheid in dit verband kan opleggen.\nVoor zover voorgaande verklaring door de verkoper te goeder trouw afgelegd werd, neemt de koper de risico’s van eventuele bodemverontreiniging en de schade zowel als de kosten die daaruit kunnen voortvloeien op zich, en verklaart hij dat de verkoper hiervoor tot geen vrijwaring zal zijn gehouden.', 'pending'),
(520, 44, 319, 'In uitvoering van het decreet van 16 april 1996 inzake de bescherming van landschappen, verklaart de verkoper dat het bij deze verkochte goed niet gelegen is binnen een voorlopig beschermd landschap, en dat er geen maatregelen en/of richtlijnen zijn opgelegd met het oog op de instandhouding en het onderhoud van landschappen, noch erfdienstbaarheden van openbaar nut, en dat er geen beperkingen op de uitoefening van de eigendoms- en gebruiksrechten bestaan die van toepassing zijn op het bij deze verkochte goed.\nIn uitvoering van het decreet van 3 maart 1976 verklaart de verkoper dat het goed niet opgenomen is in een lijst, noch voorontwerp of ontwerp van lijst van de voor bescherming vatbare monumenten, stads- en dorpsgezichten.', 'pending'),
(521, 44, 320, 'Deze verkoping is gedaan en aanvaard voor en mits de prijs van [placeholder:price_total].\nDe koper verbindt zich ertoe binnen de acht dagen vanaf heden als waarborg voor de stipte uitvoering van zijn verplichtingen een bedrag van [placeholder:deposit_amount] te storten op de bankrekeningnummer [placeholder:deposit_account] van nagenoemde notaris [placeholder:deposit_account_holder]. De notaris die deze gelden in bewaring krijgt, plaatst ze op een bijzondere rekening die hij opent op naam van de koper tot bij de ondertekening van de notariële koop-verkoopakte. Op dat ogenblik vormen deze gelden een voorschot op de prijs en dit tot beloop van het bedrag van de waarborg; de intresten van dit voorschot komen toe aan de verkoper behoudens in geval de verkoop niet kan doorgaan omwille van een niet aan de koper aan te rekenen fout of door overmacht.\nHet saldo van de verkoopprijs verbindt de koper zich te betalen bij de ondertekening van de notariële koop-verkoopakte.\nIngeval van vertraging van de betaling zal de koper een verwijlvergoeding verschuldigd zijn aan de verkoper van [placeholder:delay_penalty_annual_rate] ’s jaars op de nog verschuldigde koopprijs, behoudens wanneer deze vertraging te wijten is aan de verkoper. Deze verwijlvergoeding wordt berekend per dag vertraging en voor een jaar worden 365 dagen gerekend.\nIngeval van niet-naleving door één van de partijen van de bij deze aangegane verbintenissen en na ingebrekestelling bij aangetekend schrijven of deurwaardersexploot, welk zonder gevolg gelaten werd gedurende een periode van vijftien dagen, zal deze verkoping van rechtswege ontbonden zijn. In dit geval zal een som gelijk aan [placeholder:contract_termination_penalty] van de verkoopprijs aan de niet-ingebreke gebleven partij toekomen ten titel van schadevergoeding.\nPartijen behouden zich nochtans het recht voor de gedwongen uitvoering van deze overeenkomst te vervolgen.', 'pending'),
(522, 44, 321, 'Partijen, die ervan kennis dragen dat ieder van hen het recht heeft zijn eigen notaris te kiezen – zonder verhoging van kosten –, stellen beiden aan notaris [placeholder:notary_name] te [placeholder:notary_seller_office].\nDe notariële koop-verkoopakte dient verleden te worden op voorstel van de instrumenterende notaris binnen de [placeholder:notary_authentic_act_deadline] vanaf de vervulling van nagemelde opschortende voorwaarden.', 'pending'),
(523, 44, 322, 'Om te voldoen aan artikel 36 van het Vlaams Bodemsaneringsdecreet komen partijen overeen dat deze verkoop wordt gedaan onder de opschortende voorwaarde dat voor het bij deze verkochte goed door de Openbare Afvalstoffenmaatschappij van het Vlaams Gewest (OVAM) een bodemattest wordt afgeleverd waaruit blijkt:\n• hetzij dat voor het betrokken goed geen gegevens beschikbaar zijn;\n• hetzij dat voor het betrokken goed geen bodemverontreiniging werd vastgesteld die de bodemsaneringsnormen overschrijdt of dreigt te overschrijden, of die een ernstige bedreiging vormt.\nDe verkoper verbindt zich ertoe dit bodemattest zonder uitstel aan te vragen en de inhoud ervan mee te delen aan de koper binnen de [placeholder:ovam_attest_communication_deadline] te rekenen vanaf heden, onder voorbehoud echter dat zij het antwoord van OVAM ontvangen binnen de termijnen gesteld door voormeld decreet.\nDe eigendom van het verkochte goed gaat, zoals hiervoren vermeld, over van de verkoper op de koper bij de ondertekening van de notariële koop-verkoopakte doch op voorwaarde en nadat koper op de hoogte gebracht is van de inhoud van voormeld bodemattest en voorzover dit bodemattest voldoet aan de hoger bepaalde voorwaarden. Indien de inhoud van dit attest aan de gestelde vereisten voldoet, zal hij geacht worden deel uit te maken van onderhavige verkoopovereenkomst.', 'pending'),
(524, 44, 323, 'De koper erkent dat de notaris die de verkoopovereenkomst heeft opgesteld en waarvan de naam voorkomt, hem op de hoogte gebracht heeft van een ongevallenverzekering onderschreven bij de C.V.B.A. “Verzekeringen van het Notariaat” ingevolge een polis op naam van de notaris en waarvan de hoofdkenmerken hierna weergegeven worden:\n• de verzekering is kosteloos voor de koper;\n• verzekerd risico: overlijden door ongeval;\n• verzekerde personen: kopers natuurlijke personen;\n• verzekerd kapitaal: bedrag van de koopprijs vermeerderd met de kosten, rechten en erelonen van de overdracht, onder aftrek van de bedragen die reeds betaald werden voor dat het schadegeval zich voordeed en met uitsluiting van de bijkomende rechten en boeten als gevolg van een door het bestuur van de registratie vastgestelde meerwaarde evenals van de conventionele of moratoire intresten die zouden lopen na de datum van overlijden;\n• algemene beperking: [placeholder:insurance_limit_per_event] per gebeurtenis die aanleiding geeft tot de waarborg, welk ook het aantal afgesloten verkoopovereenkomsten zij;\n• duur van de dekking: vanaf het ondertekenen van de verkoopovereenkomst tot aan de ondertekening van de authentieke akte van aankoop met een maximumduur van [placeholder:insurance_max_duration_months] na ondertekening van de verkoopovereenkomst of de verwezenlijking van de opschortende voorwaarden die in de verkoopvoorwaarden zouden voorkomen. De authentieke akte moet verleden worden binnen de vier maanden die op het overlijden volgen.', 'pending'),
(525, 44, 324, 'Opgemaakt in drie exemplaren, waarvan elke partij verklaart minstens één exemplaar te hebben ontvangen, te [placeholder:contract_place_of_signature] op [placeholder:contract_date_of_signature].\nGelever in goedgekeurd [handtekening] Gelezen en goedgekeurd [handtekening]\nGelesen en goedgekeurd [handtekening]', 'pending'),
(526, 46, 333, 'KOOP-VERKOOPOVEREENKOMST VOOR EEN WONING. Ondergetekenden :\nA. “De verkoper” (naam, voornamen, beroep, adres, btw-nummer):\n[placeholder:seller1_full_name]\n[placeholder:seller1_address]\nB. “De koper” (naam, voornamen, beroep, adres, btw-nummer):\n[placeholder:buyer1_firstname] [placeholder:buyer1_lastname]\n[placeholder:buyer1_address]\nhebben de volgende overeenkomst gesloten. De verkoper verkoopt aan de koper, die aanvaardt, de hierna beschreven woning:\nGemeente : [placeholder:property_municipality1]\nStraat en nummer: [placeholder:property_address]\nHet verkochte goed blijkt gekadastreerd te zijn sectie [placeholder:property_cadastral_section]\nnummer [placeholder:property_cadastral_number] en heeft een oppervlakte van [placeholder:property_cadastral_surface]\nHet niet-geïndexeerde kadastraal inkomen bedraagt € [placeholder:property_cadastral_income]', 'pending'),
(527, 46, 334, '', 'pending'),
(528, 46, 335, 'De verkoop is gesloten door het ondertekenen van onderhavige overeenkomst, onder het enige voorbehoud van de hierna genoemde opschortende voorwaarde(n). De koper zal evenwel slechts de eigendom van het goed verkrijgen door het ondertekenen van de notariële akte.', 'pending'),
(529, 46, 336, 'Het goed wordt voor vrij en onbelast verkocht. De verkoop wordt echter gesloten onder de opschortende voorwaarde dat, ingeval de prijs betaald in handen van de notaris onvoldoende zou zijn om op de dag van het verlijden van de notariële akte de hypothecaire schuldeisers of beslagleggers te voldoen, deze hun toestemming verlenen tot doorhaling van hun inschrijvingen of overschrijvingen. Alleen de koper zal de niet-verwezenlijking van deze voorwaarde kunnen inroepen.', 'pending'),
(530, 46, 337, 'Het goed wordt verkocht met alle lasten, erfdienstbaarheden en gemeenschappen die bestaan in het voordeel of ten laste van het goed. In dat verband:\n(hetzij) (1) verklaart de verkoper dat er bij zijn weten geen bestaan en dat ook zijn eigendomstitel geen bijzondere erfdienstbaarheden noch voorwaarden vermeldt waardoor de waarde of het genot van het goed zou kunnen worden beïnvloed.\n(hetzij) (1) erkent de koper dat hij een kopie van de eigendomstitel heeft ontvangen en dat hij in de plaats wordt gesteld van de verkoper in alle rechten en plichten die daaruit voortvloeien.\nDe verkoper verklaart dat hij zelf geen enkele erfdienstbaarheid heeft toegestaan.', 'pending'),
(531, 46, 338, 'Het goed wordt verkocht onder de gewone waarborgen. Het moet worden geleverd in de staat waarin het zich thans bevindt.\n(hetzij) 1 In geval van verborgen gebreken beschikt de koper over een verhaalmogelijkheid.\n(hetzij) 1 In geval van verborgen gebreken kan de koper geen enkel verhaal uitoefenen tegen de verkoper.\n(1 De alinea schrappen die niet van toepassing is; zonder schrapping is de eerste alinea van toepassing.)', 'pending'),
(532, 46, 339, 'De verkoper verklaart dat het verkochte goed voldoende verzekerd is tegen brandgevaar en daarmee samenhangende risico’s en verbindt zich ertoe dezelfde verzekering aan te houden tot aan het ondertekenen van de notariële akte.', 'pending'),
(533, 46, 340, 'De koper zal het genot hebben van het verkochte goed vanaf de dag van de ondertekening van de notariële akte.\n(hetzij) 2 Het verkochte goed zal vrij van gebruik zijn uiterlijk bij de ondertekening van de notariële akte.\n(hetzij) 2 Het verkochte goed wordt thans verhuurd als [placeholder:lease_type] tegen een maandelijkse huurprijs van € [placeholder:lease_monthly_price], sinds [placeholder:lease_start_date], krachtens een schriftelijke / mondelinge 2 huurovereenkomst.\nIndien het om een schriftelijke huurovereenkomst gaat, wordt een kopie van de overeenkomst en van de eventuele bijvoegsels geparafeerd door de koper en de verkoper en gehecht aan onderhavige overeenkomst. Indien de schriftelijke huurovereenkomst en de eventuele bijvoegsels niet worden aangehecht, kan de koper, binnen vijftien dagen nadat de huurovereenkomst hem door de verkoper werd overhandigd, de nietigheid van de koop aanvoeren bij gebrek aan akkoord over een van de essentiële elementen ervan.\nIngeval een huurwaarborg werd gegeven, verbindt de verkoper zich ertoe om uiterlijk bij het verlijden van de notariële akte het voordeel ervan over te dragen aan de koper.\n(2 Schrappen wat niet past)', 'pending'),
(534, 46, 341, 'Vanaf de datum van de ingenottreding is de koper alle belastingen, lasten en taksen verschuldigd, met uitzondering van de nog niet vervallen verhaalbelastingen. De verkoper verbindt er zich toe die voor de ondertekening van de notariële akte te betalen.', 'pending'),
(535, 46, 342, 'De verkoper verklaart dat er voor de oprichting van / de verbouwingen aan het goed 1:\n(hetzij) 1 een stedenbouwkundige vergunning werd uitgereikt op [placeholder:building_permit_date]\n(hetzij) 1 geen stedenbouwkundige vergunning beschikbaar is.\nDe verkoper verklaart dat bij gebrek aan een stedenbouwkundige vergunning of stedenbouwkundig attest dat laat uitschijnen dat een dergelijke vergunning zou kunnen worden verkregen, hij geen enkele verbintenis op zich neemt betreffende de mogelijkheid om op het verkochte goed enige handeling of werken uit te voeren (met inbegrip van de gebruikswijziging van het gebouw) waarvan sprake in de wetgeving op de ruimtelijke ordening en stedenbouw van toepassing op het verkochte goed.\nDe verkoper verklaart dat:\n(hetzij) 1 een verkavelingsvergunning werd uitgereikt op [placeholder:subdivision_permit_date]\n(hetzij) 1 voor zover hem bekend, de eigendom op heden niet het voorwerp uitmaakt van enig bouwmisdrijf noch van enige dagvaarding wegens inbreuk op de wetgeving op de ruimtelijke ordening en stedenbouw.\nDe verkoper verklaart dat dit de meest recente stedenbouwkundige bestemming van het verkochte goed is: [placeholder:zoning_destination]\nIndien het goed gelegen is in het Vlaams Gewest, verklaart de verkoper dat:\n– (hetzij) 1 een gevalideerd as-builtattest bestaat in de zin van artikel 4.2.1 van de Vlaamse Codex Ruimtelijke Ordening, waarvan een kopie wordt gehecht aan de koopovereenkomst.\n– (hetzij) 1 er geen gevalideerd as-builtattest bestaat.\n– (hetzij) 1 een recht van voorkoop bestaat ten voordele van [placeholder:right_of_first_refusal_beneficiary]\n– (hetzij) 1 er geen recht van voorkoop bestaat.\nTevens wordt in dat geval de aandacht gevestigd op de bepaling van artikel 4.2.1. van de Vlaamse Codex Ruimtelijke Ordening die opsomt welke werkzaamheden slechts mogen worden uitgevoerd na voorafgaande stedenbouwkundige vergunning.\nIndien het goed gelegen is in het Brussels Hoofdstedelijk Gewest, wordt de aandacht gevestigd op de bepaling van artikel 98, §1 van het Brussels Wetboek van Ruimtelijke Ordening die opsomt welke werkzaamheden slechts mogen worden uitgevoerd na voorafgaande stedenbouwkundige vergunning.\nIndien het goed gelegen is in het Waals Gewest, wordt de aandacht erop gevestigd dat, zonder stedenbouwkundige vergunning, geen van de bedoelde werkzaamheden of handelingen uit artikel 84, § 1 van de CWATUPE en, in voorkomend geval, artikel 84, § 2, eerste lid van de CWATUPE mag worden uitgevoerd.\n(1 Schrappen wat niet past)', 'pending'),
(536, 46, 343, 'De verkoper verklaart dat er, voor zover hij weet met betrekking tot het verkochte goed, geen procedure tot onteigening loopt of gepland is, noch enige voorlopige of definitieve maatregel is getroffen in het kader van de wetgeving op de ruimtelijke ordening en de stedenbouw, bescherming als monument, stads- of dorpsgezicht of als landschap; dat het goed geen deel uitmaakt van een bos in de zin van het Bosdecreet; dat er geen recht van voorkoop of wederinkoop bestaat en dat het goed niet het voorwerp is van een ondergrondse inneming.', 'pending'),
(537, 46, 344, 'Indien het goed gelegen is in het Vlaams Gewest, verklaart de verkoper dat hij vóór het sluiten van de overeenkomst een bodemattest heeft aangevraagd bij de OVAM en de inhoud ervan heeft meegedeeld aan de koper.\nDe inhoud van dat bodemattest, uitgereikt door de OVAM op [placeholder:ovam_attest_date], is de volgende: [placeholder:ovam_attest_pollution]\nDe verkoper bevestigt uitdrukkelijk er persoonlijk geen kennis van te hebben dat op het verkochte goed een inrichting is of was gevestigd en een activiteit wordt of werd uitgevoerd die opgenomen zijn in de lijst van de inrichtingen en activiteiten die bodemverontreiniging kunnen veroorzaken zoals bedoeld in het Bodemsaneringsdecreet.', 'pending'),
(538, 46, 345, 'Indien het goed gelegen is in het Brussels Hoofdstedelijk Gewest, verklaart de verkoper dat hij vóór het sluiten van de overeenkomst een bodemattest heeft aangevraagd bij het BIM en de inhoud ervan heeft meegedeeld aan de koper.\nDe inhoud van dat bodemattest, uitgereikt door het BIM op [placeholder:bim_attest_date], is de volgende: [placeholder:bim_attest_content]\nDe verkoper bevestigt uitdrukkelijk persoonlijk geen kennis te hebben van aanvullende informatie die de inhoud van het door het BIM uitgereikte bodemattest zou kunnen wijzigen.', 'pending'),
(539, 46, 346, '(hetzij) (1) De verkoper verklaart dat voor het verkochte goed volgens de wettelijke bepalingen geen postinterventiedossier dient te bestaan.\n(hetzij) (1) De verkoper verklaart dat voor het verkochte goed een postinterventiedossier vereist is. Dat dossier zal uiterlijk bij het verlijden van de notariële akte worden overgemaakt.\n(1) Schrappen wat niet past', 'pending'),
(540, 46, 347, '(hetzij) (1) Bij het verkochte goed hoort geen stookolietank.\n(hetzij) (1) Bij het verkochte goed hoort een stookolietank. In voorkomend geval is er een keurings- en/of conformiteitsattest.\n(1) Schrappen wat niet past', 'pending'),
(541, 46, 348, '(hetzij) (1) De koper verklaart in het bezit te zijn gesteld van de laatste twee periodieke reinigings- en verbrandingsattesten voor de centrale verwarming.\n(hetzij) 1 De verkoper zal uiterlijk bij het verlijden van de notariële akte de laatste twee periodieke reinigings- en verbrandingsattesten voor de centrale verwarming bezorgen.\n(1) Schrappen wat niet past', 'pending'),
(542, 46, 349, '(hetzij) 1 De verkoper legt een proces-verbaal van onderzoek van de bestaande huishoudelijke elektrische installatie voor, opgemaakt door een erkende controle-instelling op [placeholder:electricity_inspection_date]\n(hetzij) 1 De verkoper verklaart dat de installatie dateert van voor 1 oktober 1981 en nooit werd gekeurd. Hij verbindt er zich toe om op zijn kosten een controle te laten verrichten door een erkende instelling en het proces-verbaal vóór de ondertekening van de notariële akte te bezorgen aan de notaris van de koper.\n(hetzij) 1 De verkoper verklaart dat de installatie dateert van na 1 oktober 1981 en werd gekeurd en dat de keuring niet ouder is dan 25 jaar. Hij verbindt zich ertoe om het proces-verbaal vóór de ondertekening van de notariële akte te bezorgen aan de notaris van de koper.\nIndien de installatie niet voldoet, zal:\n(hetzij) 1 de koper voor zijn rekening de installatie binnen 18 maanden in orde maken en voor zijn rekening een nieuw controleonderzoek laten uitvoeren.\n(hetzij) 1 de verkoper voor zijn rekening de installatie binnen 18 maanden in orde maken en voor zijn rekening een nieuw controleonderzoek laten uitvoeren.\n(1 Schrappen wat niet past)', 'pending'),
(543, 46, 350, '(hetzij) 1 De verkoper verklaart dat een rookmelder werd aangebracht in de woning.\n(hetzij) 1 De verkoper verklaart dat geen rookmelder werd aangebracht in de woning.\n(1 Schrappen wat niet past)', 'pending'),
(544, 46, 351, 'Het energieprestatiecertificaat van de woning bevat de volgende gegevens m.b.t. de energieprestaties van de woning: [placeholder:epc_attest_score]', 'pending'),
(545, 46, 352, 'Ligt de woning in het Vlaams Gewest, dan verklaart de verkoper dat ze ligt / niet ligt 2 in:\n– een mogelijk of effectief overstromingsgevoelig gebied;\n– een afgebakend overstromingsgebied of een afgebakende oeverzone.\n(2 Schrappen wat niet past; zonder schrapping ligt het goed niet in een dergelijk gebied)', 'pending'),
(546, 46, 353, 'De koper wordt in de plaats gesteld van de verkoper in alle rechten die deze had kunnen inroepen of had ingeroepen in het raam van de tienjarige aansprakelijkheid van architecten en aannemers, mits de koper alle kosten die daaruit voortvloeien ten laste neemt.', 'pending'),
(547, 46, 354, '(hetzij) (1) Partijen komen overeen om een tegensprekelijke plaatsbeschrijving op te maken. Dat om bijvoorbeeld te voorkomen dat de koper die reeds vóór het verlijden van de notariële akte het genot verwerft, bepaalde schade zou aanrichten of om te voorkomen dat de verkoper vóór het verlijden van de notariële akte bepaalde goederen zou wegnemen. De kosten van de plaatsbeschrijving worden in gelijke delen verdeeld onder de partijen.\n(hetzij) 1 Er wordt geen plaatsbeschrijving opgemaakt.\n(1 Schrappen wat niet past)', 'pending'),
(548, 46, 355, 'Het staat partijen vrij om in de bijzondere voorwaarden nog andere opschortende voorwaarden op te nemen dan die welke hierna wordt vermeld.\nToekenning van een hypothecair krediet\n(hetzij) 1 Onderhavige verkoop wordt niet gesloten onder de opschortende voorwaarde dat aan de koper een hypothecair krediet wordt toegestaan.\n(hetzij) 1 Onderhavige verkoop wordt gesloten onder de opschortende voorwaarde dat aan de koper een hypothecair krediet wordt toegestaan waarvan het bedrag niet hoger mag zijn dan [placeholder:contract_financing_percentage] % van de verkoopprijs 2, tegen de normale marktvoorwaarden voor een minimumduur van 15 jaar en zonder dat een bijkomende waarborg wordt geëist.\nDeze opschortende voorwaarde moet verwezenlijkt zijn binnen een termijn van [placeholder:contract_financing_clause_deadline] maanden 3 na de ondertekening van onderhavige overeenkomst.\nIndien het hypothecair krediet binnen die termijn wordt toegestaan, is de verkoop gesloten. Niettemin moet de koper de verkoper hiervan op de hoogte brengen met een aangetekend schrijven, verstuurd uiterlijk vóór het verstrijken van voormelde termijn. Zoniet heeft de verkoper recht op schadevergoeding indien hij schade kan aantonen.\nIndien het hypothecair krediet niet binnen die termijn werd verkregen, wordt de opschortende voorwaarde als niet verwezenlijkt beschouwd en is de verkoop onbestaande. De koper moet de verkoper hiervan verwittigen met een aangetekend schrijven. Het bedrag dat hij had betaald als waarborg of voorschot, moet dan aan hem worden terugbetaald, na aftrek van een vergoeding voor de tijdelijke onbeschikbaarheid van het goed.\nDie onbeschikbaarheidsvergoeding bedraagt:\n– in de veronderstelling dat de verkoper binnen de vooropgestelde termijn werd verwittigd: een half pro duizend van de bedongen prijs, per volledige dag tussen de datum van onderhavige overeenkomst en de datum waarop de aangetekende brief werd verstuurd binnen de termijn overeengekomen voor het verkrijgen van het krediet;\n– in de veronderstelling dat de verkoper pas na de vooropgestelde termijn werd verwittigd: één pro duizend van de bedongen prijs, per volledige dag tussen de vervaldag van de termijn overeengekomen voor het verkrijgen van het krediet en het versturen van de aangetekende brief die de verkoper op de hoogte brengt van het niet verkrijgen van het krediet.\nIndien de koper het bewijs niet levert van de weigering van het krediet of niet bewijst dat hij tijdig het nodige heeft ondernomen om een krediet te verkrijgen, heeft de verkoper, bij uitsluiting van elke andere schadevergoeding, recht op een forfaitaire schadevergoeding van 10 % van de verkoopprijs op voorwaarde dat hij de koper heeft aangemaand om de bewijzen te leveren en de koper hieraan geen gevolg heeft gegeven binnen 15 dagen na de aanmaning.\nDe koper kan eveneens verzaken aan huidige opschortende voorwaarde. Die verzaking is tegenstelbaar aan de verkoper op voorwaarde dat de koper hem hiervan op de hoogte bracht met een aangetekend schrijven verstuurd uiterlijk op de vervaldatum overeengekomen voor de verwezenlijking van de voorwaarde.\n(1 Schrappen wat niet past\n2 Tenzij hier een ander cijfer werd vermeld, gaat het om 100 % van de verkoopprijs\n3 Wordt de overeengekomen termijn niet opgegeven, dan bedraagt hij automatisch 2 maanden.)', 'pending'),
(549, 46, 356, 'Deze verkoop wordt toegestaan en aanvaard voor de prijs van € [placeholder:price_total], te betalen op volgende wijze:\n(hetzij) 1 De koper overhandigt aan de verkoper bij wijze van voorschot een cheque gewaarborgd of uitgeschreven door een bankinstelling ten belope van € [placeholder:deposit_amount]\n(hetzij) 1 De koper overhandigt aan de verkoper bij wijze van waarborg voor de stipte uitvoering van zijn verplichtingen een cheque gewaarborgd of uitgeschreven door een bankinstelling ten belope van € [placeholder:deposit_amount], op naam van de notaris van de verkoper. De notaris die deze gelden in bewaring krijgt, plaatst ze op een bijzondere rekening die hij opent op naam van de koper tot bij de ondertekening van de notariële akte. Op dat ogenblik vormen deze gelden een voorschot op de prijs en dat ten belope van het bedrag van de waarborg, los van de intresten die de verkoper toekomen. De intresten zijn gelijk aan de wettelijke intresten.\nHet saldo dient te worden betaald bij het verlijden van de notariële akte, door middel van een cheque gewaarborgd of uitgeschreven door een bankinstelling.\nDe koper betaalt het voorschot of de waarborg van het volgende rekeningnummer: [placeholder:deposit_account]\nKosten\nDe kosten en het ereloon van de notariële akte alsook de verschuldigde registratierechten vallen ten laste van de koper. De kosten voor opmeting, verricht op verzoek van de koper, vallen eveneens te zijnen laste.\n(1 De alinea schrappen die niet van toepassing is; zonder schrapping is de eerste alinea van toepassing)', 'pending'),
(550, 46, 357, 'Partijen verklaren te weten dat zij vrije keuze van notaris hebben, zonder dat dit enige kostenverhoging met zich meebrengt. Zij hebben voor het verlijden van de notariële akte aangesteld :\n(hetzij) 2 eenzelfde notaris, Meester [placeholder:notary_name], notaris te [placeholder:notary_office_address]\n(hetzij) 2\nvoor de verkoper: Meester [placeholder:notary_seller_name], notaris te [placeholder:notary_seller_office]\nvoor de koper: Meester [placeholder:notary_buyer_name], notaris te [placeholder:notary_buyer_office]\nDe partijen zullen uiterlijk op [placeholder:notary_authentic_act_deadline] voor de notaris verschijnen om over te gaan tot de ondertekening van de notariële akte.\n(2 Schrappen wat niet past)', 'pending'),
(551, 46, 358, '1. Indien de notariële akte niet is ondertekend op voormelde datum, kan elke partij binnen twee weken nadat ze de andere partij in gebreke heeft gesteld, per aangetekend schrijven of per deurwaardersexploot:\n– hetzij de gedwongen uitvoering van de verkoop in rechte vorderen;\n– hetzij de verkoop beschouwen als van rechtswege ontbonden.\nDe partij die in gebreke blijft, moet hoe dan ook als schadevergoeding een bedrag betalen dat forfaitair wordt vastgelegd op 10 % van de verkoopprijs. De benadeelde partij kan daarnaast ook het bewijs leveren dat zij meer schade heeft geleden. Daarenboven is de partij die in gebreke blijft, steeds verplicht om aan de wederpartij alle kosten te vergoeden.\n2. Indien de prijs of het saldo daarvan door toedoen van de koper op een latere datum wordt betaald dan de hierboven bepaalde uiterste datum voor het verlijden van de notariële akte, brengt de prijs of het saldo daarvan van rechtswege en zonder ingebrekestelling een intrest op van [placeholder:delay_penalty_annual_rate] procent per jaar. Die intrest wordt berekend vanaf de hierboven bepaalde uiterste datum tot op de datum van volledige betaling.\n(1 Indien het percentage niet werd ingevuld, wordt de wettelijke intrest aangerekend te vermeerderen met 2%.)', 'pending'),
(552, 46, 359, '[placeholder:contract_special_conditions]', 'pending'),
(553, 46, 360, 'Voor de uitvoering van onderhavige overeenkomst kiezen de partijen woonplaats op hun bovengenoemde adres en indien ze niet in België verblijven op het kantoor van de door hen aangewezen notaris.', 'pending'),
(554, 46, 361, 'Onderhavige verkoop is gesloten door bemiddeling van: [placeholder:contract_broker_name]', 'pending'),
(555, 46, 362, 'Opgemaakt te [placeholder:contract_place_of_signature] op [placeholder:contract_date_of_signature] in zoveel exemplaren als er partijen zijn.\nElke partij verklaart hierbij een exemplaar te hebben ontvangen.\nVoor ondertekening\nDe verkoper                           De koper\n(Gelieve elke bladzijde en elke eventuele schrapping te paraferen)', 'pending'),
(556, 46, 363, '- Kopie eigendomstitel\n- Bodemattest\n- Energieprestatiecertificaat\n- Stedenbouwkundige vergunning (eventueel)\n- Verkavelingsvergunning (eventueel)\n- As-builtattest (eventueel)\n- Keuringsattest stookolietank (eventueel)\n- Huurovereenkomst (eventueel)\n- Andere: [placeholder:annex_other_documents]', 'pending'),
(557, 46, 364, 'Deze overeenkomst werd opgemaakt door\nVerbruikersunie Test-Aankoop\nHollandstraat 13, 1060 Brussel\nKoninklijke Federatie van Belgische Notarissen\nBergstraat 30-32, 1000 Brussel\nVlaamse Vastgoedfederatie\nMozartstraat 24/11, 2018 Antwerpen\nUnie der Immobiliënberoepen van België\nAlbertlaan 29, 1190 Brussel\nConfederatie van Immobiliënberoepen van België\nWaterloosesteenweg 715/32, 1180 Brussel\nAangepast door Test-Aankoop\nin maart 2014', 'pending');

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `Account`
--

CREATE TABLE `Account` (
  `account_id` int NOT NULL,
  `naam` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `wachtwoord_hash` varchar(255) NOT NULL,
  `abonnementstype` varchar(50) DEFAULT NULL,
  `geldig_tot` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Gegevens worden geëxporteerd voor tabel `Account`
--

INSERT INTO `Account` (`account_id`, `naam`, `email`, `wachtwoord_hash`, `abonnementstype`, `geldig_tot`) VALUES
(1, 'Dev User', 'dev@local', 'hash', NULL, NULL);

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `Documenten`
--

CREATE TABLE `Documenten` (
  `document_id` int NOT NULL,
  `ui_id` varchar(50) DEFAULT NULL,
  `dossier_id` int NOT NULL,
  `naam` varchar(255) DEFAULT NULL,
  `bestandstype` varchar(50) DEFAULT NULL,
  `bestand_pad` varchar(512) DEFAULT NULL,
  `document_type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Gegevens worden geëxporteerd voor tabel `Documenten`
--

INSERT INTO `Documenten` (`document_id`, `ui_id`, `dossier_id`, `naam`, `bestandstype`, `bestand_pad`, `document_type`) VALUES
(20, 'doc-1766930540702-161', 24, 'Text extractie van huis - Copy.pdf', 'application/pdf', '/uploads/1766930539736-321743944.pdf', 'Uploaded'),
(25, 'doc-1767713882061-570', 33, 'Text extractie van huis - Copy.pdf', 'application/pdf', '/uploads/1767713880838-952100176.pdf', 'Uploaded'),
(26, 'doc-1768333781389-623', 36, 'Text extractie van huis - Copy.pdf', 'application/pdf', '/uploads/1768333780315-999741692.pdf', 'Uploaded');

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `Dossier`
--

CREATE TABLE `Dossier` (
  `dossier_id` int NOT NULL,
  `ui_id` varchar(50) DEFAULT NULL,
  `account_id` int NOT NULL,
  `titel` varchar(255) DEFAULT NULL,
  `verkoper_naam` varchar(255) DEFAULT NULL,
  `adres` varchar(255) DEFAULT NULL,
  `datum_aanmaak` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `archiefstatus` tinyint(1) DEFAULT '0',
  `status` varchar(50) DEFAULT 'draft',
  `type` varchar(50) DEFAULT 'House',
  `remarks` text,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Gegevens worden geëxporteerd voor tabel `Dossier`
--

INSERT INTO `Dossier` (`dossier_id`, `ui_id`, `account_id`, `titel`, `verkoper_naam`, `adres`, `datum_aanmaak`, `archiefstatus`, `status`, `type`, `remarks`, `last_modified`) VALUES
(24, 'dos-1766930539741', 1, 'Appartement Jan Janssens', 'Onbekende Verkoper', 'Kegelslei', '2025-12-28 14:02:20', 0, 'draft', 'House', NULL, '2025-12-28 14:02:38'),
(33, 'dos-1767713880855', 1, 'qslkdfgs', 'Onbekende Verkoper', 'Nieuw Pand, Onbekende Straat 1', '2026-01-06 15:38:01', 0, 'draft', 'House', NULL, '2026-01-06 15:38:01'),
(35, 'dos-1768333691618', 1, 'Stefaan heeft Haar ', 'Onbekende Verkoper', 'Nieuw Pand, Onbekende Straat 1', '2026-01-13 19:48:11', 0, 'draft', 'House', NULL, '2026-01-13 19:48:11'),
(36, 'dos-1768333780329', 1, 'reqgrbh', 'Onbekende Verkoper', 'Kegelslei', '2026-01-13 19:49:40', 0, 'draft', 'House', NULL, '2026-01-13 19:49:53');

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `PlaceholderLibrary`
--

CREATE TABLE `PlaceholderLibrary` (
  `id` int NOT NULL,
  `sleutel` varchar(100) NOT NULL,
  `beschrijving` text,
  `type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Gegevens worden geëxporteerd voor tabel `PlaceholderLibrary`
--

INSERT INTO `PlaceholderLibrary` (`id`, `sleutel`, `beschrijving`, `type`) VALUES
(1, 'seller_company1_name', 'Naam van de eerste verkopende vennootschap', 'text'),
(2, 'seller_company1_address', 'Adres van de eerste verkopende vennootschap', 'text'),
(3, 'seller_company1_kbo', 'KBO-nummer van de eerste verkopende vennootschap', 'text'),
(4, 'seller_company1_btw', 'BTW-nummer van de eerste verkopende vennootschap', 'text'),
(5, 'seller_company2_name', 'Naam van de tweede verkopende vennootschap', 'text'),
(6, 'seller_company2_address', 'Adres van de tweede verkopende vennootschap', 'text'),
(7, 'seller_company2_kbo', 'KBO-nummer van de tweede verkopende vennootschap', 'text'),
(8, 'seller_company2_btw', 'BTW-nummer van de tweede verkopende vennootschap', 'text'),
(9, 'seller_representative_firstname', 'Voornaam van de vertegenwoordiger van de verkopers', 'text'),
(10, 'seller_representative_lastname', 'Achternaam van de vertegenwoordiger van de verkopers', 'text'),
(11, 'seller_representative_role', 'Functie van de vertegenwoordiger van de verkopers', 'text'),
(12, 'buyer1_firstname', 'Voornaam van koper 1', 'text'),
(13, 'buyer1_lastname', 'Achternaam van koper 1', 'text'),
(14, 'buyer1_birthplace', 'Geboorteplaats van koper 1', 'text'),
(15, 'buyer1_birthdate', 'Geboortedatum van koper 1', 'text'),
(16, 'buyer1_address', 'Adres van koper 1', 'text'),
(17, 'buyer2_firstname', 'Voornaam van koper 2', 'text'),
(18, 'buyer2_lastname', 'Achternaam van koper 2', 'text'),
(19, 'buyer2_birthplace', 'Geboorteplaats van koper 2', 'text'),
(20, 'buyer2_birthdate', 'Geboortedatum van koper 2', 'text'),
(21, 'buyer2_address', 'Adres van koper 2', 'text'),
(22, 'buyers_marital_status', 'Huwelijksstelsel van de kopers', 'text'),
(23, 'property_residence_name', 'Naam van de residentie', 'text'),
(24, 'property_address', 'Straat en nummer van het gebouw', 'text'),
(25, 'property_municipality1', 'Eerste gemeente waarin het goed ligt', 'text'),
(26, 'property_municipality2', 'Tweede gemeente waarin het goed ligt', 'text'),
(27, 'property_koksijde_section', 'Kadastrale sectie Koksijde', 'text'),
(28, 'property_koksijde_number', 'Kadastraal nummer Koksijde', 'text'),
(29, 'property_koksijde_surface', 'Oppervlakte Koksijde', 'text'),
(30, 'property_depanne_section', 'Kadastrale sectie De Panne', 'text'),
(31, 'property_depanne_number', 'Kadastraal nummer De Panne', 'text'),
(32, 'property_depanne_surface', 'Oppervlakte De Panne', 'text'),
(33, 'unit_number', 'Nummer van het appartement', 'text'),
(34, 'unit_floor', 'Verdieping van het appartement', 'text'),
(35, 'unit_prekad_koksijde', 'Prekad-referentie appartement Koksijde', 'text'),
(36, 'unit_prekad_depanne', 'Prekad-referentie appartement De Panne', 'text'),
(37, 'unit_private_rooms', 'Beschrijving van privatieve ruimtes', 'text'),
(38, 'unit_storage_number', 'Nummer van de privatieve berging', 'text'),
(39, 'unit_common_share', 'Aandeel van het appartement in de gemeenschappelijke delen', 'text'),
(40, 'garage_number', 'Nummer van de garage', 'text'),
(41, 'garage_prekad_koksijde', 'Prekad-referentie garage Koksijde', 'text'),
(42, 'garage_prekad_depanne', 'Prekad-referentie garage De Panne', 'text'),
(43, 'garage_common_share', 'Aandeel van de garage in de gemeenschappelijke delen', 'text'),
(44, 'building_permit_date', 'Datum van de oorspronkelijke bouwvergunning', 'text'),
(45, 'building_permit_number', 'Dossiernummer van de oorspronkelijke bouwvergunning', 'text'),
(46, 'building_permit_mod1_date', 'Datum van de eerste wijzigende vergunning', 'text'),
(47, 'building_permit_mod1_number', 'Dossiernummer van de eerste wijzigende vergunning', 'text'),
(48, 'building_permit_mod2_date', 'Datum van de tweede wijzigende vergunning', 'text'),
(49, 'building_permit_mod2_number', 'Dossiernummer van de tweede wijzigende vergunning', 'text'),
(50, 'zoning_plan_name', 'Naam van het geldende plannenregister', 'text'),
(51, 'zoning_destination', 'Stedenbouwkundige bestemming volgens plannenregister', 'text'),
(52, 'price_total', 'Totaalprijs van de verkoop', 'text'),
(53, 'price_apartment', 'Prijs van het appartement', 'text'),
(54, 'price_ground', 'Prijs van de grondwaarde', 'text'),
(55, 'price_construction', 'Prijs van de constructiewaarde', 'text'),
(56, 'price_garage', 'Prijs van de garage', 'text'),
(57, 'price_garage_ground', 'Grondwaarde van de garage', 'text'),
(58, 'price_garage_construction', 'Constructiewaarde van de garage', 'text'),
(59, 'deposit_amount', 'Voorschotbedrag', 'text'),
(60, 'deposit_account', 'Rekeningnummer waarop het voorschot werd betaald', 'text'),
(61, 'deposit_account_holder', 'Naam van de rekeninghouder', 'text'),
(62, 'payment_schedule_foundation', 'Percentage te betalen bij fundering', 'text'),
(63, 'payment_schedule_garages', 'Percentage te betalen bij afdekking garages', 'text'),
(64, 'payment_schedule_level0', 'Percentage te betalen bij afdekking niveau 0', 'text'),
(65, 'payment_schedule_level1', 'Percentage te betalen bij afdekking niveau 1', 'text'),
(66, 'payment_schedule_roof', 'Percentage te betalen bij dakverdichting', 'text'),
(67, 'payment_schedule_windows', 'Percentage te betalen bij buitenschrijnwerk', 'text'),
(68, 'payment_schedule_tech', 'Percentage te betalen bij technieken', 'text'),
(69, 'payment_schedule_provisional', 'Percentage te betalen bij voorlopige oplevering', 'text'),
(70, 'works_start_date', 'Startdatum van de bouwwerken', 'text'),
(71, 'works_private_duration', 'Aantal werkdagen voor privatieve delen', 'text'),
(72, 'works_common_duration', 'Aantal werkdagen voor gemeenschappelijke delen', 'text'),
(73, 'delay_penalty_daily', 'Bedrag van de vertragingsvergoeding per dag', 'text'),
(74, 'epb_attest_info', 'EPB-informatie zoals vermeld in compromis', 'text'),
(75, 'epc_attest_code', 'EPC-code', 'text'),
(76, 'epc_attest_date', 'Datum van het EPC-attest', 'text'),
(77, 'epc_attest_score', 'EPC-score', 'text'),
(78, 'ovam_attest_date', 'Datum van het bodemattest', 'text'),
(79, 'ovam_attest_status', 'Status van het bodemattest (risico/niet-risico)', 'text'),
(80, 'ovam_attest_pollution', 'Informatie over bodemverontreiniging', 'text'),
(81, 'ovam_attest_usage_restrictions', 'Gebruiksbeperkingen volgens bodemattest', 'text'),
(82, 'water_flood_risk_zone', 'Type overstromingsgevoelig gebied', 'text'),
(83, 'water_flood_risk_status', 'Overstromingsrisico volgens verkoper', 'text'),
(84, 'heritage_status', 'Erfgoedstatus van het goed', 'text'),
(85, 'postinterventiedossier_private_deadline', 'Termijn PID privatieve delen', 'text'),
(86, 'electricity_inspection_date', 'Datum van de elektriciteitskeuring', 'text'),
(87, 'notary_seller_office', 'Adres van de notaris van de verkoper', 'text'),
(88, 'notary_buyer_office', 'Adres van de notaris van de koper', 'text'),
(89, 'notary_authentic_act_deadline', 'Deadline voor verlijden van de akte', 'text'),
(90, 'contract_financing_clause_amount', 'Bedrag van de financieringsvoorwaarde', 'text'),
(91, 'contract_financing_clause_deadline', 'Deadline van de financieringsvoorwaarde', 'text'),
(92, 'contract_place_of_signature', 'Plaats van ondertekening van de compromis', 'text'),
(93, 'contract_date_of_signature', 'Datum van ondertekening van de compromis', 'text'),
(94, 'syndic_name', 'Naam van de syndicus', 'text'),
(95, 'syndic_address', 'Adres van de syndicus', 'text'),
(96, 'ownership_transfer_ground', 'Datum eigendomsoverdracht grond', 'text'),
(97, 'ownership_transfer_construction', 'Regel eigendomsoverdracht constructie', 'text'),
(98, 'warranty_type', 'Type waarborg (Wet Breyne)', 'text'),
(99, 'warranty_conditions', 'Voorwaarden van de waarborg', 'text'),
(100, 'financing_delegation_conditions', 'Voorwaarden delegatie aan bank', 'text'),
(101, 'solidarity_between_buyers', 'Hoofdelijke aansprakelijkheid kopers', 'text'),
(102, 'notarial_act_deadline', 'Deadline voor verlijden akte', 'text'),
(103, 'stedenbouw_register_available', 'Of plannen- en vergunningenregister beschikbaar is', 'text'),
(104, 'stedenbouw_uittreksel_koksijde_date', 'Datum stedenbouwkundig uittreksel Koksijde', 'text'),
(105, 'stedenbouw_uittreksel_depanne_date', 'Datum stedenbouwkundig uittreksel De Panne', 'text'),
(106, 'stedenbouw_violation_status', 'Of er overtredingen zijn vastgesteld', 'text'),
(107, 'water_risk_possible', 'Of het goed in mogelijk overstromingsgebied ligt', 'text'),
(108, 'water_risk_effective', 'Of het goed in effectief overstromingsgebied ligt', 'text'),
(109, 'water_risk_floodzone', 'Of het goed in afgebakend overstromingsgebied ligt', 'text'),
(110, 'water_risk_riverzone', 'Of het goed in afgebakende oeverzone ligt', 'text'),
(111, 'contract_termination_conditions', 'Voorwaarden voor ontbinding', 'text'),
(112, 'contract_termination_penalty', 'Schadevergoeding bij ontbinding', 'text'),
(113, 'delivery_provisional_conditions', 'Voorwaarden voorlopige oplevering', 'text'),
(114, 'delivery_definitive_conditions', 'Voorwaarden definitieve oplevering', 'text'),
(115, 'contract_broker_name', 'Naam van de bemiddelaar', 'text'),
(116, 'contract_broker_address', 'Adres van de bemiddelaar', 'text'),
(117, 'contract_creation_place', 'Plaats van opmaak', 'text'),
(118, 'contract_creation_date', 'Datum van opmaak', 'text'),
(119, 'seller_firstname', 'seller_firstname', 'text'),
(132, 'seller1_full_name', '', 'text'),
(133, 'seller1_birthplace', '', 'text'),
(134, 'seller1_birthdate', '', 'date'),
(135, 'seller1_address', '', 'text'),
(136, 'property_detailed_description', '', 'text'),
(137, 'property_cadastral_section', '', 'text'),
(138, 'property_cadastral_number', '', 'text'),
(139, 'property_cadastral_surface', '', 'text'),
(140, 'zoning_regional_plan_name', '', 'text'),
(141, 'delay_penalty_annual_rate', '', 'text'),
(142, 'notary_name', '', 'text'),
(143, 'ovam_attest_communication_deadline', '', 'text'),
(144, 'insurance_limit_per_event', '', 'text'),
(145, 'insurance_max_duration_months', '', 'text'),
(146, 'property_cadastral_income', '', 'text'),
(147, 'lease_type', '', 'text'),
(148, 'lease_monthly_price', '', 'text'),
(149, 'lease_start_date', '', 'text'),
(150, 'subdivision_permit_date', '', 'date'),
(151, 'right_of_first_refusal_beneficiary', '', 'text'),
(152, 'bim_attest_date', '', 'date'),
(153, 'bim_attest_content', '', 'text'),
(154, 'contract_financing_percentage', '', 'text'),
(155, 'notary_office_address', '', 'text'),
(156, 'notary_seller_name', '', 'text'),
(157, 'notary_buyer_name', '', 'text'),
(158, 'contract_special_conditions', '', 'text'),
(159, 'annex_other_documents', '', 'text');

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `Provider`
--

CREATE TABLE `Provider` (
  `provider_id` int NOT NULL,
  `naam` varchar(100) NOT NULL,
  `api_key` varchar(255) DEFAULT NULL,
  `support_contact` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `Sectie`
--

CREATE TABLE `Sectie` (
  `sectie_id` int NOT NULL,
  `template_id` int NOT NULL,
  `titel` varchar(255) DEFAULT NULL,
  `tekst_content` text,
  `volgorde` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Gegevens worden geëxporteerd voor tabel `Sectie`
--

INSERT INTO `Sectie` (`sectie_id`, `template_id`, `titel`, `tekst_content`, `volgorde`) VALUES
(1, 2, 'Nieuwe Sectie', '', 0),
(162, 1, 'Nieuwe Sectie', '', 0),
(196, 3, NULL, '[placeholder:seller_firstname]', 0),
(284, 33, NULL, 'DE ONDERGETEKENDEN:\n1. De heer [placeholder:seller1_full_name], geboren te [placeholder:seller1_birthplace] op [placeholder:seller1_birthdate], wonende te [placeholder:seller1_address]. Hierna gezamenlijk genoemd “de verkoper”.\n2. De heer [placeholder:buyer1_lastname] [placeholder:buyer1_firstname], geboren te [placeholder:buyer1_birthplace] op [placeholder:buyer1_birthdate], en zijn echtgenote mevrouw [placeholder:buyer2_lastname] [placeholder:buyer2_firstname], geboren te [placeholder:buyer2_birthplace] op [placeholder:buyer2_birthdate], samenwonende te [placeholder:buyer1_address]. Gehuwd onder het beheer van de [placeholder:buyers_marital_status]. Hierna gezamenlijk genoemd “de koper”.\nZIJN OVEREENGEKOMEN WAT VOLGT:\nDe verkoper verklaart – onder cumulatieve vervulling van nagemelde opschortende voorwaarde – te verkopen, af te staan en over te dragen aan de koper, die aanvaardt – ieder tot beloop van de onverdeelde helft in volle eigendom – het hierna omschreven onroerend goed en dit onder de gewone waarborgen van daad en van recht, en voor vrij, zuiver en onbelast van alle voorrechten, hypotheken, bezwarende overschrijvingen of kantmeldingen en alle welkdanige lasten of schulden. De verkoper verklaart exclusief en voor de geheelheid in volle eigendom eigenaar te zijn van nagemeld onroerend goed en niet reeds eerder dit te hebben verkocht aan een derde, hetzij mondeling hetzij bij geschrift dat tot op heden niet werd ontbonden of nietig verklaard, op welke wijze ook. Verder verklaart de verkoper dat met betrekking tot nagemeld onroerend goed:\n• er hem geen besluit tot onteigening of geen voornemen tot opeising is bekend;\n• er geen recht van voorkoop en/of wederinkoop en/of optie bestaat, noch door hem een voorkeurrecht tot aankoop werd verleend in voordeel van een derde, behoudens datgene hierna uitdrukkelijk vermeld;\n• dat dit niet het voorwerp uitmaakt van het wettelijk recht van voorkoop ingesteld door de wet van de landpacht en/of valt onder toepassing van de wet op de ruilverkaveling en/of het decreet op het natuurbehoud en het natuurlijk milieu.', 0),
(285, 33, NULL, 'Gemeente [placeholder:property_municipality1] – 3e afdeling, voorheen [placeholder:property_municipality2]: Een [placeholder:property_detailed_description], gekadastreerd sectie [placeholder:property_cadastral_section] nr. [placeholder:property_cadastral_number], groot volgens titel [placeholder:property_cadastral_surface]. Hierna kortweg omschreven als “het goed” of “voorschreven goed”.', 1),
(286, 33, NULL, '', 2),
(287, 33, NULL, 'Het goed wordt verkocht in de staat waarin het zich thans bevindt en onder meer:\n• zonder waarborg van maat en oppervlakte, al bedragen de verschillen één/twintigste of meer;\n• met alle voor- en nadelige erfdienstbaarheden;\n• met alle zichtbare en verborgen gebreken, zonder vrijwaring dezer;\n• met alle gemeenschappen.\nDe verkoper verklaart geen weet te hebben van het bestaan van erfdienstbaarheden en er zelf geen te hebben toegestaan.', 3),
(288, 33, NULL, 'De koper treedt in het recht van eigendom van het voorschreven goed te rekenen vanaf de ondertekening van de notariële koop-verkoopakte en zal er ook te rekenen vanaf dan alle openbare lasten, gemeentelijke en andere belastingen en taksen van dragen en betalen. Niet-vervallen annuïteiten van verhaalbelastingen en andere gemeentelijke taksen of belastingen zijn voor rekening van de koper vanaf zelfde datum. De verkoper verklaart dat er naar zijn weten thans geen verhaalbelastingen verschuldigd zijn noch betekend werden. De verkoper verklaart tevens dat het goed, noch geheel noch gedeeltelijk, is onderworpen aan het wettelijk recht van voorkoop ingesteld door de wet op de landpacht. De koper zal het genot hebben van voorschreven onroerend goed door de vrije beschikking en effectieve inbezitname vanaf de ondertekening van de notariële koop-verkoopakte en de volledige betaling van de verkoopprijs.', 4),
(289, 33, NULL, 'Alle kosten, rechten en erelonen waartoe deze verkoop kan aanleiding geven, zijn ten laste van de koper, evenals de eventuele opmetingskosten.', 5),
(290, 33, NULL, 'In geval van bouwen zal de koper zich moeten onderwerpen aan de beslissingen en reglementen van de bevoegde instanties. Om te voldoen aan de voorschriften van het “decreet houdende de organisatie van de ruimtelijke ordening” wordt er verklaard door de verkoper dat voor het niet-bebouwde gedeelte geen bouw-, verkavelings- en stedenbouwkundige vergunning werd afgeleverd, en behoudens overlegging van een stedenbouwkundige vergunning die laat voorzien dat een dergelijke vergunning zou kunnen worden verkregen, de verkoper geen verzekering geeft wat de mogelijkheid betreft om op dit gedeelte van het goed te bouwen of daarop enige vaste of verplaatsbare inrichting op te stellen die voor bewoning kan worden gebruikt, noch enige verzekering wordt door de verkoper gegeven om de bestaande constructies te verbouwen. Artikel 99 van het decreet houdende de organisatie van de ruimtelijke ordening luidt letterlijk als volgt: “§1. Niemand mag zonder voorafgaande stedenbouwkundige vergunning: 1° bouwen, op een grond één of meer vaste inrichtingen plaatsen, een bestaande vaste inrichting of bestaand bouwwerk afbreken, herbouwen, verbouwen of uitbreiden, met uitzondering van instandhoudings- of onderhoudswerken; 2° ontbossen in de zin van het bosdecreet van 13 juni 1990 van alle met bomen begroeide oppervlakten bedoeld in artikel 3, §1 en §2 van dat decreet; 3° hoogstammige bomen vellen, alleenstaand, in groeps- of lijnverband, voorzover ze geen deel uitmaken van met bomen begroeide oppervlakten in de zin van artikel 3, §1 en §2, van het bosdecreet van 13 juni 1990; 4° het reliëf van de bodem aanmerkelijk wijzigen; 5° een grond gewoonlijk gebruiken, aanleggen of inrichten voor: a) het opslaan van gebruikte of afgedankte voertuigen, van allerhande materialen, materieel of afval; b) het parkeren van voertuigen, wagens of aanhangwagens; c) het plaatsen van één of meer verplaatsbare inrichtingen die voor bewoning kunnen worden gebruikt, zoals woonwagens, kampeerwagens, afgedankte voertuigen, tenten; d) het plaatsen van één of meer verplaatsbare inrichtingen of rollend materieel die hoofdzakelijk voor publicitaire doeleinden worden gebruikt; 6° het geheel of gedeeltelijk wijzigen van de hoofdfunctie van een onroerend bebouwd goed met het oog op een nieuwe functie, voorzover deze functiewijziging voorkomt op een door de Vlaamse regering op te stellen lijst van de vergunningsplichtige functiewijzigingen; 7° in een gebouw het aantal woongelegenheden wijzigen die bestemd zijn voor de huisvesting van een gezin of een alleenstaande, ongeacht of het gaat om een eensgezinswoning, een etagewoning, een flatgebouw, een studio of een al dan niet gemeubileerde kamer; 8° publiciteitsinrichtingen of uithangborden plaatsen of wijzigen; 9° recreatieve terreinen aanleggen of wijzigen, waaronder een golfterrein, een voetbalterrein, een tennisveld, een zwembad. Onder bouwen en plaatsen van vaste inrichtingen, zoals bedoeld in het eerste lid, 1°, wordt verstaan het oprichten van een gebouw of een constructie of het plaatsen van een inrichting, zelfs uit niet-duurzame materialen, in de grond ingebouwd, aan de grond bevestigd of op de grond steunend omwille van de stabiliteit, en bestemd om ter plaatse te blijven staan, ook al kan het ook uit elkaar worden genomen, verplaatst of is het volledig ondergronds. Dit behelst ook het functioneel samenbrengen van materialen waardoor een vaste inrichting of constructie ontstaat, en het aanbrengen van verhardingen. Onder instandhoudings- of onderhoudswerken zoals bedoeld in het eerste lid, 1°, worden werken verstaan die het gebruik van het gebouw voor de toekomst ongewijzigd veiligstellen door het bijwerken, herstellen of vervangen van geërodeerde of versleten materialen of onderdelen. Hieronder kunnen geen werken begrepen worden die betrekking hebben op de constructieve elementen van het gebouw, zoals: 1° vervangen van dakgebintes of dragende balken van het dak, met uitzondering van plaatselijke herstellingen; 2° geheel of gedeeltelijk herbouwen of vervangen van buitenmuren, zelfs met recuperatie van de bestaande stenen. Als hoogstammige boom zoals bedoeld in het eerste lid, 3°, wordt beschouwd elke boom die op een hoogte van 1 meter boven het maaiveld een stamomtrek van 1 meter heeft. Als aanmerkelijke reliëfwijziging zoals bedoeld in het eerste lid, 4°, wordt onder meer beschouwd elke aanvulling, ophoging, uitgraving of uitdieping die de aard of functie van het terrein wijzigt. Onverminderd het eerste lid 5°, c, is geen stedenbouwkundige vergunning vereist voor het kamperen met verplaatsbare inrichtingen op een kampeerterrein in de zin van het decreet van 3 maart 1993 houdende het statuut van de terreinen voor openluchtrecreatieve verblijven. §2. De Vlaamse regering kan de lijst vaststellen van de werken, handelingen en wijzigingen waarvoor, wegens hun aard en/of omvang, in afwijking van §1, geen stedenbouwkundige vergunning vereist is. §3. Een provinciale en een gemeentelijke stedenbouwkundige verordening kunnen de vergunningsplichtige werken, handelingen en wijzigingen, genoemd in §1, aanvullen. Ze kunnen ook voor de met toepassing van §2 van vergunning vrijgestelde werken en handelingen de stedenbouwkundige vergunningsplicht invoeren.” Het bij deze verkochte goed is volgens het [placeholder:zoning_plan_name] gelegen in het [placeholder:zoning_destination] bestemd voor de landbouw.', 6),
(291, 33, NULL, 'a) De verkoper verklaart dat er op de grond, die het voorwerp is van onderhavige akte, bij zijn weten geen inrichting gevestigd is of was, of geen activiteit wordt of werd uitgevoerd die opgenomen is in de lijst van inrichtingen en activiteiten die bodemverontreiniging kunnen veroorzaken, zoals bedoeld in artikel 3, §1, van het Bodemsaneringsdecreet. b) De verkoper verklaart met betrekking tot het verkochte goed geen weet te hebben van bodemverontreiniging die schade kan berokkenen aan de koper of aan derden, of die aanleiding kan geven tot een saneringsverplichting, tot gebruiksbeperkingen of tot andere maatregelen die de overheid in dit verband kan opleggen. Voor zover voorgaande verklaring door de verkoper te goeder trouw afgelegd werd, neemt de koper de risico’s van eventuele bodemverontreiniging en de schade zowel als de kosten die daaruit kunnen voortvloeien op zich, en verklaart hij dat de verkoper hiervoor tot geen vrijwaring zal zijn gehouden.', 7),
(292, 33, NULL, 'In uitvoering van het decreet van 16 april 1996 inzake de bescherming van landschappen, verklaart de verkoper dat het bij deze verkochte goed niet gelegen is binnen een voorlopig beschermd landschap, en dat er geen maatregelen en/of richtlijnen zijn opgelegd met het oog op de instandhouding en het onderhoud van landschappen, noch erfdienstbaarheden van openbaar nut, en dat er geen beperkingen op de uitoefening van de eigendoms- en gebruiksrechten bestaan die van toepassing zijn op het bij deze verkochte goed. In uitvoering van het decreet van 3 maart 1976 verklaart de verkoper dat het goed niet opgenomen is in een lijst, noch voorontwerp of ontwerp van lijst van de voor bescherming vatbare monumenten, stads- en dorpsgezichten.', 8),
(293, 33, NULL, 'Deze verkoping is gedaan en aanvaard voor en mits de prijs van [placeholder:price_total]. De koper verbindt zich ertoe binnen de acht dagen vanaf heden als waarborg voor de stipte uitvoering van zijn verplichtingen een bedrag van [placeholder:deposit_amount] te storten op de bankrekeningnummer [placeholder:deposit_account] van nagenoemde notaris [placeholder:deposit_account_holder]. De notaris die deze gelden in bewaring krijgt, plaatst ze op een bijzondere rekening die hij opent op naam van de koper tot bij de ondertekening van de notariële koop-verkoopakte. Op dat ogenblik vormen deze gelden een voorschot op de prijs en dit tot beloop van het bedrag van de waarborg; de intresten van dit voorschot komen toe aan de verkoper behoudens in geval de verkoop niet kan doorgaan omwille van een niet aan de koper aan te rekenen fout of door overmacht. Het saldo van de verkoopprijs verbindt de koper zich te betalen bij de ondertekening van de notariële koop-verkoopakte. Ingeval van vertraging van de betaling zal de koper een verwijlvergoeding verschuldigd zijn aan de verkoper van tien frank ten honderd (10 %) ’s jaars op de nog verschuldigde koopprijs, behoudens wanneer deze vertraging te wijten is aan de verkoper. Deze verwijlvergoeding wordt berekend per dag vertraging en voor een jaar worden 365 dagen gerekend. Ingeval van niet-naleving door één van de partijen van de bij deze aangegane verbintenissen en na ingebrekestelling bij aangetekend schrijven of deurwaardersexploot, welk zonder gevolg gelaten werd gedurende een periode van vijftien dagen, zal deze verkoping van rechtswege ontbonden zijn. In dit geval zal een som gelijk aan [placeholder:contract_termination_penalty] van de verkoopprijs aan de niet-ingebreke gebleven partij toekomen ten titel van schadevergoeding. Partijen behouden zich nochtans het recht voor de gedwongen uitvoering van deze overeenkomst te vervolgen.', 9),
(294, 33, NULL, 'Partijen, die ervan kennis dragen dat ieder van hen het recht heeft zijn eigen notaris te kiezen – zonder verhoging van kosten –, stellen beiden aan notaris André Costa te [placeholder:notary_seller_office]. De notariële koop-verkoopakte dient verleden te worden op voorstel van de instrumenterende notaris binnen de [placeholder:notary_authentic_act_deadline] vanaf de vervulling van nagemelde opschortende voorwaarden.', 10),
(295, 33, NULL, 'Om te voldoen aan artikel 36 van het Vlaams Bodemsaneringsdecreet komen partijen overeen dat deze verkoop wordt gedaan onder de opschortende voorwaarde dat voor het bij deze verkochte goed door de Openbare Afvalstoffenmaatschappij van het Vlaams Gewest (OVAM) een bodemattest wordt afgeleverd waaruit blijkt:\n• hetzij dat voor het betrokken goed geen gegevens beschikbaar zijn;\n• hetzij dat voor het betrokken goed geen bodemverontreiniging werd vastgesteld die de bodemsaneringsnormen overschrijdt of dreigt te overschrijden, of die een ernstige bedreiging vormt.\nDe verkoper verbindt zich ertoe dit bodemattest zonder uitstel aan te vragen en de inhoud ervan mee te delen aan de koper binnen de maand te rekenen vanaf heden, onder voorbehoud echter dat zij het antwoord van OVAM ontvangen binnen de termijnen gesteld door voormeld decreet. De eigendom van het verkochte goed gaat, zoals hiervoren vermeld, over van de verkoper op de koper bij de ondertekening van de notariële koop-verkoopakte doch op voorwaarde en nadat koper op de hoogte gebracht is van de inhoud van voormeld bodemattest en voorzover dit bodemattest voldoet aan de hoger bepaalde voorwaarden. Indien de inhoud van dit attest aan de gestelde vereisten voldoet, zal hij geacht worden deel uit te maken van onderhavige verkoopovereenkomst.\nVerzekering in geval van overlijden bij ongeval van de koper: De koper erkent dat de notaris die de verkoopovereenkomst heeft opgesteld en waarvan de naam voorkomt, hem op de hoogte gebracht heeft van een ongevallenverzekering onderschreven bij de C.V.B.A. “Verzekeringen van het Notariaat” ingevolge een polis op naam van de notaris en waarvan de hoofdkenmerken hierna weergegeven worden:\n• de verzekering is kosteloos voor de koper;\n• verzekerd risico: overlijden door ongeval;\n• verzekerde personen: kopers natuurlijke personen;\n• verzekerd kapitaal: bedrag van de koopprijs vermeerderd met de kosten, rechten en erelonen van de overdracht, onder aftrek van de bedragen die reeds betaald werden voor dat het schadegeval zich voordeed en met uitsluiting van de bijkomende rechten en boeten als gevolg van een door het bestuur van de registratie vastgestelde meerwaarde evenals van de conventionele of moratoire intresten die zouden lopen na de datum van overlijden;\n• algemene beperking: honderddrieëntwintigduizend negenhonderdzesenveertig euro zesenzeventig cent per gebeurtenis die aanleiding geeft tot de waarborg, welk ook het aantal afgesloten verkoopovereenkomsten zij;\n• duur van de dekking: vanaf het ondertekenen van de verkoopovereenkomst tot aan de ondertekening van de authentieke akte van aankoop met een maximumduur van vier maanden na ondertekening van de verkoopovereenkomst of de verwezenlijking van de opschortende voorwaarden die in de verkoopvoorwaarden zouden voorkomen. De authentieke akte moet verleden worden binnen de vier maanden die op het overlijden volgen.', 11),
(296, 33, NULL, 'Opgemaakt in drie exemplaren, waarvan elke partij verklaart minstens één exemplaar te hebben ontvangen, te [placeholder:contract_place_of_signature] op [placeholder:contract_date_of_signature].\n\nGelever in goedgekeurd [handtekening] Gelezen en goedgekeurd [handtekening] Gelesen en goedgekeurd [handtekening]', 12),
(311, 34, 'ONDERHANDSE VERKOOPOVEREENKOMST ONROEREND GOED', 'DE ONDERGETEKENDEN:\n1. De heer [placeholder:seller1_full_name], geboren te [placeholder:seller1_birthplace] op [placeholder:seller1_birthdate], wonende te [placeholder:seller1_address]. Hierna gezamenlijk genoemd “de verkoper”.\n2. De heer [placeholder:buyer1_lastname] [placeholder:buyer1_firstname], geboren te [placeholder:buyer1_birthplace] op [placeholder:buyer1_birthdate], en zijn echtgenote mevrouw [placeholder:buyer2_lastname] [placeholder:buyer2_firstname], geboren te [placeholder:buyer2_birthplace] op [placeholder:buyer2_birthdate], samenwonende te [placeholder:buyer1_address]. Gehuwd onder het beheer van de [placeholder:buyers_marital_status]. Hierna gezamenlijk genoemd “de koper”.', 0),
(312, 34, 'ZIJN OVEREENGEKOMEN WAT VOLGT:', 'De verkoper verklaart – onder cumulatieve vervulling van nagemelde opschortende voorwaarde – te verkopen, af te staan en over te dragen aan de koper, die aanvaardt – ieder tot beloop van de onverdeelde helft in volle eigendom – het hierna omschreven onroerend goed en dit onder de gewone waarborgen van daad en van recht, en voor vrij, zuiver en onbelast van alle voorrechten, hypotheken, bezwarende overschrijvingen of kantmeldingen en alle welkdanige lasten of schulden.\nDe verkoper verklaart exclusief en voor de geheelheid in volle eigendom eigenaar te zijn van nagemeld onroerend goed en niet reeds eerder dit te hebben verkocht aan een derde, hetzij mondeling hetzij bij geschrift dat tot op heden niet werd ontbonden of nietig verklaard, op welke wijze ook. Verder verklaart de verkoper dat met betrekking tot nagemeld onroerend goed:\n• er hem geen besluit tot onteigening of geen voornemen tot opeising is bekend;\n• er geen recht van voorkoop en/of wederinkoop en/of optie bestaat, noch door hem een voorkeurrecht tot aankoop werd verleend in voordeel van een derde, behoudens datgene hierna uitdrukkelijk vermeld;\n• dat dit niet het voorwerp uitmaakt van het wettelijk recht van voorkoop ingesteld door de wet van de landpacht en/of valt onder toepassing van de wet op de ruilverkaveling en/of het decreet op het natuurbehoud en het natuurlijk milieu.', 1),
(313, 34, 'BESCHRIJVING VAN HET GOED:', 'Gemeente [placeholder:property_municipality1] – 3e afdeling, voorheen [placeholder:property_municipality2]: [placeholder:property_detailed_description], gelegen aan de Kegelslei, gekadastreerd sectie [placeholder:property_cadastral_section] nr. [placeholder:property_cadastral_number], groot volgens titel [placeholder:property_cadastral_surface]. Hierna kortweg omschreven als “het goed” of “voorschreven goed”.', 2),
(314, 34, 'VOORWAARDEN:', '1° Toestand – Erfdienstbaarheden: Het goed wordt verkocht in de staat waarin het zich thans bevindt en onder meer:\n• zonder waarborg van maat en oppervlakte, al bedragen de verschillen één/twintigste of meer;\n• met alle voor- en nadelige erfdienstbaarheden;\n• met alle zichtbare en verborgen gebreken, zonder vrijwaring dezer;\n• met alle gemeenschappen.\nDe verkoper verklaart geen weet te hebben van het bestaan van erfdienstbaarheden en er zelf geen te hebben toegestaan.', 3),
(315, 34, '2° Eigendom – Bezit – Genot:', 'De koper treedt in het recht van eigendom van het voorschreven goed te rekenen vanaf de ondertekening van de notariële koop-verkoopakte en zal er ook te rekenen vanaf dan alle openbare lasten, gemeentelijke en andere belastingen en taksen van dragen en betalen. Niet-vervallen annuïteiten van verhaalbelastingen en andere gemeentelijke taksen of belastingen zijn voor rekening van de koper vanaf zelfde datum.\nDe verkoper verklaart dat er naar zijn weten thans geen verhaalbelastingen verschuldigd zijn noch betekend werden.\nDe verkoper verklaart tevens dat het goed, noch geheel noch gedeeltelijk, is onderworpen aan het wettelijk recht van voorkoop ingesteld door de wet op de landpacht.\nDe koper zal het genot hebben van voorschreven onroerend goed door de vrije beschikking en effectieve inbezitname vanaf de ondertekening van de notariële koop-verkoopakte en de volledige betaling van de verkoopprijs.', 4),
(316, 34, '3° Kosten:', 'Alle kosten, rechten en erelonen waartoe deze verkoop kan aanleiding geven, zijn ten laste van de koper, evenals de eventuele opmetingskosten.', 5),
(317, 34, '4° Stedenbouw:', 'In geval van bouwen zal de koper zich moeten onderwerpen aan de beslissingen en reglementen van de bevoegde instanties.\nOm te voldoen aan de voorschriften van het “decreet houdende de organisatie van de ruimtelijke ordening” wordt er verklaard door de verkoper dat voor het niet-bebouwde gedeelte geen bouw-, verkavelings- en stedenbouwkundige vergunning werd afgeleverd, en behoudens overlegging van een stedenbouwkundige vergunning die laat voorzien dat een dergelijke vergunning zou kunnen worden verkregen, de verkoper geen verzekering geeft wat de mogelijkheid betreft om op dit gedeelte van het goed te bouwen of daarop enige vaste of verplaatsbare inrichting op te stellen die voor bewoning kan worden gebruikt, noch enige verzekering wordt door de verkoper gegeven om de bestaande constructies te verbouwen.\nArtikel 99 van het decreet houdende de organisatie van de ruimtelijke ordening luidt letterlijk als volgt:\n“§1. Niemand mag zonder voorafgaande stedenbouwkundige vergunning:\n1° bouwen, op een grond één of meer vaste inrichtingen plaatsen, een bestaande vaste inrichting of bestaand bouwwerk afbreken, herbouwen, verbouwen of uitbreiden, met uitzondering van instandhoudings- of onderhoudswerken;\n2° ontbossen in de zin van het bosdecreet van 13 juni 1990 van alle met bomen begroeide oppervlakten bedoeld in artikel 3, §1 en §2 van dat decreet;\n3° hoogstammige bomen vellen, alleenstaand, in groeps- of lijnverband, voorzover ze geen deel uitmaken van met bomen begroeide oppervlakten in de zin van artikel 3, §1 en §2, van het bosdecreet van 13 juni 1990;\n4° het reliëf van de bodem aanmerkelijk wijzigen;\n5° een grond gewoonlijk gebruiken, aanleggen of inrichten voor:\na) het opslaan van gebruikte of afgedankte voertuigen, van allerhande materialen, materieel of afval; b) het parkeren van voertuigen, wagens of aanhangwagens; c) het plaatsen van één of meer verplaatsbare inrichtingen die voor bewoning kunnen worden gebruikt, zoals woonwagens, kampeerwagens, afgedankte voertuigen, tenten; d) het plaatsen van één of meer verplaatsbare inrichtingen of rollend materieel die hoofdzakelijk voor publicitaire doeleinden worden gebruikt;\n6° het geheel of gedeeltelijk wijzigen van de hoofdfunctie van een onroerend bebouwd goed met het oog op een nieuwe functie, voorzover deze functiewijziging voorkomt op een door de Vlaamse regering op te stellen lijst van de vergunningsplichtige functiewijzigingen;\n7° in een gebouw het aantal woongelegenheden wijzigen die bestemd zijn voor de huisvesting van een gezin of een alleenstaande, ongeacht of het gaat om een eensgezinswoning, een etagewoning, een flatgebouw, een studio of een al dan niet gemeubileerde kamer;\n8° publiciteitsinrichtingen of uithangborden plaatsen of wijzigen;\n9° recreatieve terreinen aanleggen of wijzigen, waaronder een golfterrein, een voetbalterrein, een tennisveld, een zwembad.\nOnder bouwen en plaatsen van vaste inrichtingen, zoals bedoeld in het eerste lid, 1°, wordt verstaan het oprichten van een gebouw of een constructie of het plaatsen van een inrichting, zelfs uit niet-duurzame materialen, in de grond ingebouwd, aan de grond bevestigd of op de grond steunend omwille van de stabiliteit, en bestemd om ter plaatse te blijven staan, ook al kan het ook uit elkaar worden genomen, verplaatst of is het volledig ondergronds. Dit behelst ook het functioneel samenbrengen van materialen waardoor een vaste inrichting of constructie ontstaat, en het aanbrengen van verhardingen.\nOnder instandhoudings- of onderhoudswerken zoals bedoeld in het eerste lid, 1°, worden werken verstaan die het gebruik van het gebouw voor de toekomst ongewijzigd veiligstellen door het bijwerken, herstellen of vervangen van geërodeerde of versleten materialen of onderdelen. Hieronder kunnen geen werken begrepen worden die betrekking hebben op de constructieve elementen van het gebouw, zoals:\n1° vervangen van dakgebintes of dragende balken van het dak, met uitzondering van plaatselijke herstellingen; 2° geheel of gedeeltelijk herbouwen of vervangen van buitenmuren, zelfs met recuperatie van de bestaande stenen.\nAls hoogstammige boom zoals bedoeld in het eerste lid, 3°, wordt beschouwd elke boom die op een hoogte van 1 meter boven het maaiveld een stamomtrek van 1 meter heeft.\nAls aanmerkelijke reliëfwijziging zoals bedoeld in het eerste lid, 4°, wordt onder meer beschouwd elke aanvulling, ophoging, uitgraving of uitdieping die de aard of functie van het terrein wijzigt. Onverminderd het eerste lid 5°, c, is geen stedenbouwkundige vergunning vereist voor het kamperen met verplaatsbare inrichtingen op een kampeerterrein in de zin van het decreet van 3 maart 1993 houdende het statuut van de terreinen voor openluchtrecreatieve verblijven.\n§2. De Vlaamse regering kan de lijst vaststellen van de werken, handelingen en wijzigingen waarvoor, wegens hun aard en/of omvang, in afwijking van §1, geen stedenbouwkundige vergunning vereist is.\n§3. Een provinciale en een gemeentelijke stedenbouwkundige verordening kunnen de vergunningsplichtige werken, handelingen en wijzigingen, genoemd in §1, aanvullen. Ze kunnen ook voor de met toepassing van §2 van vergunning vrijgestelde werken en handelingen de stedenbouwkundige vergunningsplicht invoeren.”\nHet bij deze verkochte goed is volgens het gewestplan [placeholder:zoning_regional_plan_name] gelegen in het [placeholder:zoning_destination].', 6),
(318, 34, '5° Verklaring inzake de bodemtoestand:', 'a) De verkoper verklaart dat er op de grond, die het voorwerp is van onderhavige akte, bij zijn weten geen inrichting gevestigd is of was, of geen activiteit wordt of werd uitgevoerd die opgenomen is in de lijst van inrichtingen en activiteiten die bodemverontreiniging kunnen veroorzaken, zoals bedoeld in artikel 3, §1, van het Bodemsaneringsdecreet.\nb) De verkoper verklaart met betrekking tot het verkochte goed geen weet te hebben van bodemverontreiniging die schade kan berokkenen aan de koper of aan derden, of die aanleiding kan geven tot een saneringsverplichting, tot gebruiksbeperkingen of tot andere maatregelen die de overheid in dit verband kan opleggen.\nVoor zover voorgaande verklaring door de verkoper te goeder trouw afgelegd werd, neemt de koper de risico’s van eventuele bodemverontreiniging en de schade zowel als de kosten die daaruit kunnen voortvloeien op zich, en verklaart hij dat de verkoper hiervoor tot geen vrijwaring zal zijn gehouden.', 7),
(319, 34, '6° Verklaring niet-bescherming:', 'In uitvoering van het decreet van 16 april 1996 inzake de bescherming van landschappen, verklaart de verkoper dat het bij deze verkochte goed niet gelegen is binnen een voorlopig beschermd landschap, en dat er geen maatregelen en/of richtlijnen zijn opgelegd met het oog op de instandhouding en het onderhoud van landschappen, noch erfdienstbaarheden van openbaar nut, en dat er geen beperkingen op de uitoefening van de eigendoms- en gebruiksrechten bestaan die van toepassing zijn op het bij deze verkochte goed.\nIn uitvoering van het decreet van 3 maart 1976 verklaart de verkoper dat het goed niet opgenomen is in een lijst, noch voorontwerp of ontwerp van lijst van de voor bescherming vatbare monumenten, stads- en dorpsgezichten.', 8),
(320, 34, 'VERKOOPPRIJS:', 'Deze verkoping is gedaan en aanvaard voor en mits de prijs van [placeholder:price_total].\nDe koper verbindt zich ertoe binnen de acht dagen vanaf heden als waarborg voor de stipte uitvoering van zijn verplichtingen een bedrag van [placeholder:deposit_amount] te storten op de bankrekeningnummer [placeholder:deposit_account] van nagenoemde notaris [placeholder:deposit_account_holder]. De notaris die deze gelden in bewaring krijgt, plaatst ze op een bijzondere rekening die hij opent op naam van de koper tot bij de ondertekening van de notariële koop-verkoopakte. Op dat ogenblik vormen deze gelden een voorschot op de prijs en dit tot beloop van het bedrag van de waarborg; de intresten van dit voorschot komen toe aan de verkoper behoudens in geval de verkoop niet kan doorgaan omwille van een niet aan de koper aan te rekenen fout of door overmacht.\nHet saldo van de verkoopprijs verbindt de koper zich te betalen bij de ondertekening van de notariële koop-verkoopakte.\nIngeval van vertraging van de betaling zal de koper een verwijlvergoeding verschuldigd zijn aan de verkoper van [placeholder:delay_penalty_annual_rate] ’s jaars op de nog verschuldigde koopprijs, behoudens wanneer deze vertraging te wijten is aan de verkoper. Deze verwijlvergoeding wordt berekend per dag vertraging en voor een jaar worden 365 dagen gerekend.\nIngeval van niet-naleving door één van de partijen van de bij deze aangegane verbintenissen en na ingebrekestelling bij aangetekend schrijven of deurwaardersexploot, welk zonder gevolg gelaten werd gedurende een periode van vijftien dagen, zal deze verkoping van rechtswege ontbonden zijn. In dit geval zal een som gelijk aan [placeholder:contract_termination_penalty] van de verkoopprijs aan de niet-ingebreke gebleven partij toekomen ten titel van schadevergoeding.\nPartijen behouden zich nochtans het recht voor de gedwongen uitvoering van deze overeenkomst te vervolgen.', 9),
(321, 34, 'NOTARIËLE AKTE:', 'Partijen, die ervan kennis dragen dat ieder van hen het recht heeft zijn eigen notaris te kiezen – zonder verhoging van kosten –, stellen beiden aan notaris [placeholder:notary_name] te [placeholder:notary_seller_office].\nDe notariële koop-verkoopakte dient verleden te worden op voorstel van de instrumenterende notaris binnen de [placeholder:notary_authentic_act_deadline] vanaf de vervulling van nagemelde opschortende voorwaarden.', 10),
(322, 34, 'OPSCHORTENDE VOORWAARDEN:', 'Om te voldoen aan artikel 36 van het Vlaams Bodemsaneringsdecreet komen partijen overeen dat deze verkoop wordt gedaan onder de opschortende voorwaarde dat voor het bij deze verkochte goed door de Openbare Afvalstoffenmaatschappij van het Vlaams Gewest (OVAM) een bodemattest wordt afgeleverd waaruit blijkt:\n• hetzij dat voor het betrokken goed geen gegevens beschikbaar zijn;\n• hetzij dat voor het betrokken goed geen bodemverontreiniging werd vastgesteld die de bodemsaneringsnormen overschrijdt of dreigt te overschrijden, of die een ernstige bedreiging vormt.\nDe verkoper verbindt zich ertoe dit bodemattest zonder uitstel aan te vragen en de inhoud ervan mee te delen aan de koper binnen de [placeholder:ovam_attest_communication_deadline] te rekenen vanaf heden, onder voorbehoud echter dat zij het antwoord van OVAM ontvangen binnen de termijnen gesteld door voormeld decreet.\nDe eigendom van het verkochte goed gaat, zoals hiervoren vermeld, over van de verkoper op de koper bij de ondertekening van de notariële koop-verkoopakte doch op voorwaarde en nadat koper op de hoogte gebracht is van de inhoud van voormeld bodemattest en voorzover dit bodemattest voldoet aan de hoger bepaalde voorwaarden. Indien de inhoud van dit attest aan de gestelde vereisten voldoet, zal hij geacht worden deel uit te maken van onderhavige verkoopovereenkomst.', 11),
(323, 34, 'Verzekering in geval van overlijden bij ongeval van de koper:', 'De koper erkent dat de notaris die de verkoopovereenkomst heeft opgesteld en waarvan de naam voorkomt, hem op de hoogte gebracht heeft van een ongevallenverzekering onderschreven bij de C.V.B.A. “Verzekeringen van het Notariaat” ingevolge een polis op naam van de notaris en waarvan de hoofdkenmerken hierna weergegeven worden:\n• de verzekering is kosteloos voor de koper;\n• verzekerd risico: overlijden door ongeval;\n• verzekerde personen: kopers natuurlijke personen;\n• verzekerd kapitaal: bedrag van de koopprijs vermeerderd met de kosten, rechten en erelonen van de overdracht, onder aftrek van de bedragen die reeds betaald werden voor dat het schadegeval zich voordeed en met uitsluiting van de bijkomende rechten en boeten als gevolg van een door het bestuur van de registratie vastgestelde meerwaarde evenals van de conventionele of moratoire intresten die zouden lopen na de datum van overlijden;\n• algemene beperking: [placeholder:insurance_limit_per_event] per gebeurtenis die aanleiding geeft tot de waarborg, welk ook het aantal afgesloten verkoopovereenkomsten zij;\n• duur van de dekking: vanaf het ondertekenen van de verkoopovereenkomst tot aan de ondertekening van de authentieke akte van aankoop met een maximumduur van [placeholder:insurance_max_duration_months] na ondertekening van de verkoopovereenkomst of de verwezenlijking van de opschortende voorwaarden die in de verkoopvoorwaarden zouden voorkomen. De authentieke akte moet verleden worden binnen de vier maanden die op het overlijden volgen.', 12),
(324, 34, 'SLOTBEPALINGEN', 'Opgemaakt in drie exemplaren, waarvan elke partij verklaart minstens één exemplaar te hebben ontvangen, te [placeholder:contract_place_of_signature] op [placeholder:contract_date_of_signature].\nGelever in goedgekeurd [handtekening] Gelezen en goedgekeurd [handtekening]\nGelesen en goedgekeurd [handtekening]', 13),
(333, 39, 'KOOP-VERKOOPOVEREENKOMST VOOR EEN WONING', 'KOOP-VERKOOPOVEREENKOMST VOOR EEN WONING. Ondergetekenden :\nA. “De verkoper” (naam, voornamen, beroep, adres, btw-nummer):\n[placeholder:seller1_full_name]\n[placeholder:seller1_address]\nB. “De koper” (naam, voornamen, beroep, adres, btw-nummer):\n[placeholder:buyer1_firstname] [placeholder:buyer1_lastname]\n[placeholder:buyer1_address]\nhebben de volgende overeenkomst gesloten. De verkoper verkoopt aan de koper, die aanvaardt, de hierna beschreven woning:\nGemeente : [placeholder:property_municipality1]\nStraat en nummer: [placeholder:property_address]\nHet verkochte goed blijkt gekadastreerd te zijn sectie [placeholder:property_cadastral_section]\nnummer [placeholder:property_cadastral_number] en heeft een oppervlakte van [placeholder:property_cadastral_surface]\nHet niet-geïndexeerde kadastraal inkomen bedraagt € [placeholder:property_cadastral_income]', 0),
(334, 39, 'VERKOOPSVOORWAARDEN', '', 1),
(335, 39, '1. EIGENDOMSOVERDRACHT', 'De verkoop is gesloten door het ondertekenen van onderhavige overeenkomst, onder het enige voorbehoud van de hierna genoemde opschortende voorwaarde(n). De koper zal evenwel slechts de eigendom van het goed verkrijgen door het ondertekenen van de notariële akte.', 2),
(336, 39, '2. HYPOTHECAIRE TOESTAND', 'Het goed wordt voor vrij en onbelast verkocht. De verkoop wordt echter gesloten onder de opschortende voorwaarde dat, ingeval de prijs betaald in handen van de notaris onvoldoende zou zijn om op de dag van het verlijden van de notariële akte de hypothecaire schuldeisers of beslagleggers te voldoen, deze hun toestemming verlenen tot doorhaling van hun inschrijvingen of overschrijvingen. Alleen de koper zal de niet-verwezenlijking van deze voorwaarde kunnen inroepen.', 3),
(337, 39, '3. LASTEN, ERFDIENSTBAARHEDEN EN GEMEENSCHAPPEN', 'Het goed wordt verkocht met alle lasten, erfdienstbaarheden en gemeenschappen die bestaan in het voordeel of ten laste van het goed. In dat verband:\n(hetzij) (1) verklaart de verkoper dat er bij zijn weten geen bestaan en dat ook zijn eigendomstitel geen bijzondere erfdienstbaarheden noch voorwaarden vermeldt waardoor de waarde of het genot van het goed zou kunnen worden beïnvloed.\n(hetzij) (1) erkent de koper dat hij een kopie van de eigendomstitel heeft ontvangen en dat hij in de plaats wordt gesteld van de verkoper in alle rechten en plichten die daaruit voortvloeien.\nDe verkoper verklaart dat hij zelf geen enkele erfdienstbaarheid heeft toegestaan.', 4),
(338, 39, '4. STAAT VAN HET GOED', 'Het goed wordt verkocht onder de gewone waarborgen. Het moet worden geleverd in de staat waarin het zich thans bevindt.\n(hetzij) 1 In geval van verborgen gebreken beschikt de koper over een verhaalmogelijkheid.\n(hetzij) 1 In geval van verborgen gebreken kan de koper geen enkel verhaal uitoefenen tegen de verkoper.\n(1 De alinea schrappen die niet van toepassing is; zonder schrapping is de eerste alinea van toepassing.)', 5),
(339, 39, '5. WONINGVERZEKERING', 'De verkoper verklaart dat het verkochte goed voldoende verzekerd is tegen brandgevaar en daarmee samenhangende risico’s en verbindt zich ertoe dezelfde verzekering aan te houden tot aan het ondertekenen van de notariële akte.', 6),
(340, 39, '6. GENOT VAN HET GOED', 'De koper zal het genot hebben van het verkochte goed vanaf de dag van de ondertekening van de notariële akte.\n(hetzij) 2 Het verkochte goed zal vrij van gebruik zijn uiterlijk bij de ondertekening van de notariële akte.\n(hetzij) 2 Het verkochte goed wordt thans verhuurd als [placeholder:lease_type] tegen een maandelijkse huurprijs van € [placeholder:lease_monthly_price], sinds [placeholder:lease_start_date], krachtens een schriftelijke / mondelinge 2 huurovereenkomst.\nIndien het om een schriftelijke huurovereenkomst gaat, wordt een kopie van de overeenkomst en van de eventuele bijvoegsels geparafeerd door de koper en de verkoper en gehecht aan onderhavige overeenkomst. Indien de schriftelijke huurovereenkomst en de eventuele bijvoegsels niet worden aangehecht, kan de koper, binnen vijftien dagen nadat de huurovereenkomst hem door de verkoper werd overhandigd, de nietigheid van de koop aanvoeren bij gebrek aan akkoord over een van de essentiële elementen ervan.\nIngeval een huurwaarborg werd gegeven, verbindt de verkoper zich ertoe om uiterlijk bij het verlijden van de notariële akte het voordeel ervan over te dragen aan de koper.\n(2 Schrappen wat niet past)', 7),
(341, 39, '7. BELASTINGEN', 'Vanaf de datum van de ingenottreding is de koper alle belastingen, lasten en taksen verschuldigd, met uitzondering van de nog niet vervallen verhaalbelastingen. De verkoper verbindt er zich toe die voor de ondertekening van de notariële akte te betalen.', 8),
(342, 39, '8. RUIMTELIJKE ORDENING EN STEDENBOUW', 'De verkoper verklaart dat er voor de oprichting van / de verbouwingen aan het goed 1:\n(hetzij) 1 een stedenbouwkundige vergunning werd uitgereikt op [placeholder:building_permit_date]\n(hetzij) 1 geen stedenbouwkundige vergunning beschikbaar is.\nDe verkoper verklaart dat bij gebrek aan een stedenbouwkundige vergunning of stedenbouwkundig attest dat laat uitschijnen dat een dergelijke vergunning zou kunnen worden verkregen, hij geen enkele verbintenis op zich neemt betreffende de mogelijkheid om op het verkochte goed enige handeling of werken uit te voeren (met inbegrip van de gebruikswijziging van het gebouw) waarvan sprake in de wetgeving op de ruimtelijke ordening en stedenbouw van toepassing op het verkochte goed.\nDe verkoper verklaart dat:\n(hetzij) 1 een verkavelingsvergunning werd uitgereikt op [placeholder:subdivision_permit_date]\n(hetzij) 1 voor zover hem bekend, de eigendom op heden niet het voorwerp uitmaakt van enig bouwmisdrijf noch van enige dagvaarding wegens inbreuk op de wetgeving op de ruimtelijke ordening en stedenbouw.\nDe verkoper verklaart dat dit de meest recente stedenbouwkundige bestemming van het verkochte goed is: [placeholder:zoning_destination]\nIndien het goed gelegen is in het Vlaams Gewest, verklaart de verkoper dat:\n– (hetzij) 1 een gevalideerd as-builtattest bestaat in de zin van artikel 4.2.1 van de Vlaamse Codex Ruimtelijke Ordening, waarvan een kopie wordt gehecht aan de koopovereenkomst.\n– (hetzij) 1 er geen gevalideerd as-builtattest bestaat.\n– (hetzij) 1 een recht van voorkoop bestaat ten voordele van [placeholder:right_of_first_refusal_beneficiary]\n– (hetzij) 1 er geen recht van voorkoop bestaat.\nTevens wordt in dat geval de aandacht gevestigd op de bepaling van artikel 4.2.1. van de Vlaamse Codex Ruimtelijke Ordening die opsomt welke werkzaamheden slechts mogen worden uitgevoerd na voorafgaande stedenbouwkundige vergunning.\nIndien het goed gelegen is in het Brussels Hoofdstedelijk Gewest, wordt de aandacht gevestigd op de bepaling van artikel 98, §1 van het Brussels Wetboek van Ruimtelijke Ordening die opsomt welke werkzaamheden slechts mogen worden uitgevoerd na voorafgaande stedenbouwkundige vergunning.\nIndien het goed gelegen is in het Waals Gewest, wordt de aandacht erop gevestigd dat, zonder stedenbouwkundige vergunning, geen van de bedoelde werkzaamheden of handelingen uit artikel 84, § 1 van de CWATUPE en, in voorkomend geval, artikel 84, § 2, eerste lid van de CWATUPE mag worden uitgevoerd.\n(1 Schrappen wat niet past)', 9),
(343, 39, '9. OVERHEIDSMAATREGELEN', 'De verkoper verklaart dat er, voor zover hij weet met betrekking tot het verkochte goed, geen procedure tot onteigening loopt of gepland is, noch enige voorlopige of definitieve maatregel is getroffen in het kader van de wetgeving op de ruimtelijke ordening en de stedenbouw, bescherming als monument, stads- of dorpsgezicht of als landschap; dat het goed geen deel uitmaakt van een bos in de zin van het Bosdecreet; dat er geen recht van voorkoop of wederinkoop bestaat en dat het goed niet het voorwerp is van een ondergrondse inneming.', 10),
(344, 39, '10. DECREET VAN HET VLAAMSE GEWEST i.v.m. DE BODEMTOESTAND', 'Indien het goed gelegen is in het Vlaams Gewest, verklaart de verkoper dat hij vóór het sluiten van de overeenkomst een bodemattest heeft aangevraagd bij de OVAM en de inhoud ervan heeft meegedeeld aan de koper.\nDe inhoud van dat bodemattest, uitgereikt door de OVAM op [placeholder:ovam_attest_date], is de volgende: [placeholder:ovam_attest_pollution]\nDe verkoper bevestigt uitdrukkelijk er persoonlijk geen kennis van te hebben dat op het verkochte goed een inrichting is of was gevestigd en een activiteit wordt of werd uitgevoerd die opgenomen zijn in de lijst van de inrichtingen en activiteiten die bodemverontreiniging kunnen veroorzaken zoals bedoeld in het Bodemsaneringsdecreet.', 11),
(345, 39, '11. ORDONNANTIE VAN HET BRUSSELS HOOFDSTEDELIJK GEWEST i.v.m. DE BODEMTOESTAND', 'Indien het goed gelegen is in het Brussels Hoofdstedelijk Gewest, verklaart de verkoper dat hij vóór het sluiten van de overeenkomst een bodemattest heeft aangevraagd bij het BIM en de inhoud ervan heeft meegedeeld aan de koper.\nDe inhoud van dat bodemattest, uitgereikt door het BIM op [placeholder:bim_attest_date], is de volgende: [placeholder:bim_attest_content]\nDe verkoper bevestigt uitdrukkelijk persoonlijk geen kennis te hebben van aanvullende informatie die de inhoud van het door het BIM uitgereikte bodemattest zou kunnen wijzigen.', 12),
(346, 39, '12. POSTINTERVENTIEDOSSIER', '(hetzij) (1) De verkoper verklaart dat voor het verkochte goed volgens de wettelijke bepalingen geen postinterventiedossier dient te bestaan.\n(hetzij) (1) De verkoper verklaart dat voor het verkochte goed een postinterventiedossier vereist is. Dat dossier zal uiterlijk bij het verlijden van de notariële akte worden overgemaakt.\n(1) Schrappen wat niet past', 13),
(347, 39, '13. STOOKOLIETANK', '(hetzij) (1) Bij het verkochte goed hoort geen stookolietank.\n(hetzij) (1) Bij het verkochte goed hoort een stookolietank. In voorkomend geval is er een keurings- en/of conformiteitsattest.\n(1) Schrappen wat niet past', 14),
(348, 39, '14. CENTRALE VERWARMINGSINSTALLATIE - KEURINGSATTEST VOOR VERWARMINGSKETEL VAN 20 kW OF MEER', '(hetzij) (1) De koper verklaart in het bezit te zijn gesteld van de laatste twee periodieke reinigings- en verbrandingsattesten voor de centrale verwarming.\n(hetzij) 1 De verkoper zal uiterlijk bij het verlijden van de notariële akte de laatste twee periodieke reinigings- en verbrandingsattesten voor de centrale verwarming bezorgen.\n(1) Schrappen wat niet past', 15),
(349, 39, '15. KEURING VAN DE ELEKTRICITEIT', '(hetzij) 1 De verkoper legt een proces-verbaal van onderzoek van de bestaande huishoudelijke elektrische installatie voor, opgemaakt door een erkende controle-instelling op [placeholder:electricity_inspection_date]\n(hetzij) 1 De verkoper verklaart dat de installatie dateert van voor 1 oktober 1981 en nooit werd gekeurd. Hij verbindt er zich toe om op zijn kosten een controle te laten verrichten door een erkende instelling en het proces-verbaal vóór de ondertekening van de notariële akte te bezorgen aan de notaris van de koper.\n(hetzij) 1 De verkoper verklaart dat de installatie dateert van na 1 oktober 1981 en werd gekeurd en dat de keuring niet ouder is dan 25 jaar. Hij verbindt zich ertoe om het proces-verbaal vóór de ondertekening van de notariële akte te bezorgen aan de notaris van de koper.\nIndien de installatie niet voldoet, zal:\n(hetzij) 1 de koper voor zijn rekening de installatie binnen 18 maanden in orde maken en voor zijn rekening een nieuw controleonderzoek laten uitvoeren.\n(hetzij) 1 de verkoper voor zijn rekening de installatie binnen 18 maanden in orde maken en voor zijn rekening een nieuw controleonderzoek laten uitvoeren.\n(1 Schrappen wat niet past)', 16),
(350, 39, '16. ROOKMELDER', '(hetzij) 1 De verkoper verklaart dat een rookmelder werd aangebracht in de woning.\n(hetzij) 1 De verkoper verklaart dat geen rookmelder werd aangebracht in de woning.\n(1 Schrappen wat niet past)', 17),
(351, 39, '17. ENERGIEPRESTATIECERTIFICAAT', 'Het energieprestatiecertificaat van de woning bevat de volgende gegevens m.b.t. de energieprestaties van de woning: [placeholder:epc_attest_score]', 18),
(352, 39, '18. OVERSTROMINGSGEVOELIG VASTGOED', 'Ligt de woning in het Vlaams Gewest, dan verklaart de verkoper dat ze ligt / niet ligt 2 in:\n– een mogelijk of effectief overstromingsgevoelig gebied;\n– een afgebakend overstromingsgebied of een afgebakende oeverzone.\n(2 Schrappen wat niet past; zonder schrapping ligt het goed niet in een dergelijk gebied)', 19),
(353, 39, '19. TIENJARIGE AANSPRAKELIJKHEID', 'De koper wordt in de plaats gesteld van de verkoper in alle rechten die deze had kunnen inroepen of had ingeroepen in het raam van de tienjarige aansprakelijkheid van architecten en aannemers, mits de koper alle kosten die daaruit voortvloeien ten laste neemt.', 20),
(354, 39, '20. PLAATSBESCHRIJVING', '(hetzij) (1) Partijen komen overeen om een tegensprekelijke plaatsbeschrijving op te maken. Dat om bijvoorbeeld te voorkomen dat de koper die reeds vóór het verlijden van de notariële akte het genot verwerft, bepaalde schade zou aanrichten of om te voorkomen dat de verkoper vóór het verlijden van de notariële akte bepaalde goederen zou wegnemen. De kosten van de plaatsbeschrijving worden in gelijke delen verdeeld onder de partijen.\n(hetzij) 1 Er wordt geen plaatsbeschrijving opgemaakt.\n(1 Schrappen wat niet past)', 21);
INSERT INTO `Sectie` (`sectie_id`, `template_id`, `titel`, `tekst_content`, `volgorde`) VALUES
(355, 39, '21. OPSCHORTENDE VOORWAARDEN', 'Het staat partijen vrij om in de bijzondere voorwaarden nog andere opschortende voorwaarden op te nemen dan die welke hierna wordt vermeld.\nToekenning van een hypothecair krediet\n(hetzij) 1 Onderhavige verkoop wordt niet gesloten onder de opschortende voorwaarde dat aan de koper een hypothecair krediet wordt toegestaan.\n(hetzij) 1 Onderhavige verkoop wordt gesloten onder de opschortende voorwaarde dat aan de koper een hypothecair krediet wordt toegestaan waarvan het bedrag niet hoger mag zijn dan [placeholder:contract_financing_percentage] % van de verkoopprijs 2, tegen de normale marktvoorwaarden voor een minimumduur van 15 jaar en zonder dat een bijkomende waarborg wordt geëist.\nDeze opschortende voorwaarde moet verwezenlijkt zijn binnen een termijn van [placeholder:contract_financing_clause_deadline] maanden 3 na de ondertekening van onderhavige overeenkomst.\nIndien het hypothecair krediet binnen die termijn wordt toegestaan, is de verkoop gesloten. Niettemin moet de koper de verkoper hiervan op de hoogte brengen met een aangetekend schrijven, verstuurd uiterlijk vóór het verstrijken van voormelde termijn. Zoniet heeft de verkoper recht op schadevergoeding indien hij schade kan aantonen.\nIndien het hypothecair krediet niet binnen die termijn werd verkregen, wordt de opschortende voorwaarde als niet verwezenlijkt beschouwd en is de verkoop onbestaande. De koper moet de verkoper hiervan verwittigen met een aangetekend schrijven. Het bedrag dat hij had betaald als waarborg of voorschot, moet dan aan hem worden terugbetaald, na aftrek van een vergoeding voor de tijdelijke onbeschikbaarheid van het goed.\nDie onbeschikbaarheidsvergoeding bedraagt:\n– in de veronderstelling dat de verkoper binnen de vooropgestelde termijn werd verwittigd: een half pro duizend van de bedongen prijs, per volledige dag tussen de datum van onderhavige overeenkomst en de datum waarop de aangetekende brief werd verstuurd binnen de termijn overeengekomen voor het verkrijgen van het krediet;\n– in de veronderstelling dat de verkoper pas na de vooropgestelde termijn werd verwittigd: één pro duizend van de bedongen prijs, per volledige dag tussen de vervaldag van de termijn overeengekomen voor het verkrijgen van het krediet en het versturen van de aangetekende brief die de verkoper op de hoogte brengt van het niet verkrijgen van het krediet.\nIndien de koper het bewijs niet levert van de weigering van het krediet of niet bewijst dat hij tijdig het nodige heeft ondernomen om een krediet te verkrijgen, heeft de verkoper, bij uitsluiting van elke andere schadevergoeding, recht op een forfaitaire schadevergoeding van 10 % van de verkoopprijs op voorwaarde dat hij de koper heeft aangemaand om de bewijzen te leveren en de koper hieraan geen gevolg heeft gegeven binnen 15 dagen na de aanmaning.\nDe koper kan eveneens verzaken aan huidige opschortende voorwaarde. Die verzaking is tegenstelbaar aan de verkoper op voorwaarde dat de koper hem hiervan op de hoogte bracht met een aangetekend schrijven verstuurd uiterlijk op de vervaldatum overeengekomen voor de verwezenlijking van de voorwaarde.\n(1 Schrappen wat niet past\n2 Tenzij hier een ander cijfer werd vermeld, gaat het om 100 % van de verkoopprijs\n3 Wordt de overeengekomen termijn niet opgegeven, dan bedraagt hij automatisch 2 maanden.)', 22),
(356, 39, '22. PRIJS', 'Deze verkoop wordt toegestaan en aanvaard voor de prijs van € [placeholder:price_total], te betalen op volgende wijze:\n(hetzij) 1 De koper overhandigt aan de verkoper bij wijze van voorschot een cheque gewaarborgd of uitgeschreven door een bankinstelling ten belope van € [placeholder:deposit_amount]\n(hetzij) 1 De koper overhandigt aan de verkoper bij wijze van waarborg voor de stipte uitvoering van zijn verplichtingen een cheque gewaarborgd of uitgeschreven door een bankinstelling ten belope van € [placeholder:deposit_amount], op naam van de notaris van de verkoper. De notaris die deze gelden in bewaring krijgt, plaatst ze op een bijzondere rekening die hij opent op naam van de koper tot bij de ondertekening van de notariële akte. Op dat ogenblik vormen deze gelden een voorschot op de prijs en dat ten belope van het bedrag van de waarborg, los van de intresten die de verkoper toekomen. De intresten zijn gelijk aan de wettelijke intresten.\nHet saldo dient te worden betaald bij het verlijden van de notariële akte, door middel van een cheque gewaarborgd of uitgeschreven door een bankinstelling.\nDe koper betaalt het voorschot of de waarborg van het volgende rekeningnummer: [placeholder:deposit_account]\nKosten\nDe kosten en het ereloon van de notariële akte alsook de verschuldigde registratierechten vallen ten laste van de koper. De kosten voor opmeting, verricht op verzoek van de koper, vallen eveneens te zijnen laste.\n(1 De alinea schrappen die niet van toepassing is; zonder schrapping is de eerste alinea van toepassing)', 23),
(357, 39, '23. NOTARISSEN', 'Partijen verklaren te weten dat zij vrije keuze van notaris hebben, zonder dat dit enige kostenverhoging met zich meebrengt. Zij hebben voor het verlijden van de notariële akte aangesteld :\n(hetzij) 2 eenzelfde notaris, Meester [placeholder:notary_name], notaris te [placeholder:notary_office_address]\n(hetzij) 2\nvoor de verkoper: Meester [placeholder:notary_seller_name], notaris te [placeholder:notary_seller_office]\nvoor de koper: Meester [placeholder:notary_buyer_name], notaris te [placeholder:notary_buyer_office]\nDe partijen zullen uiterlijk op [placeholder:notary_authentic_act_deadline] voor de notaris verschijnen om over te gaan tot de ondertekening van de notariële akte.\n(2 Schrappen wat niet past)', 24),
(358, 39, '24. SANCTIES', '1. Indien de notariële akte niet is ondertekend op voormelde datum, kan elke partij binnen twee weken nadat ze de andere partij in gebreke heeft gesteld, per aangetekend schrijven of per deurwaardersexploot:\n– hetzij de gedwongen uitvoering van de verkoop in rechte vorderen;\n– hetzij de verkoop beschouwen als van rechtswege ontbonden.\nDe partij die in gebreke blijft, moet hoe dan ook als schadevergoeding een bedrag betalen dat forfaitair wordt vastgelegd op 10 % van de verkoopprijs. De benadeelde partij kan daarnaast ook het bewijs leveren dat zij meer schade heeft geleden. Daarenboven is de partij die in gebreke blijft, steeds verplicht om aan de wederpartij alle kosten te vergoeden.\n2. Indien de prijs of het saldo daarvan door toedoen van de koper op een latere datum wordt betaald dan de hierboven bepaalde uiterste datum voor het verlijden van de notariële akte, brengt de prijs of het saldo daarvan van rechtswege en zonder ingebrekestelling een intrest op van [placeholder:delay_penalty_annual_rate] procent per jaar. Die intrest wordt berekend vanaf de hierboven bepaalde uiterste datum tot op de datum van volledige betaling.\n(1 Indien het percentage niet werd ingevuld, wordt de wettelijke intrest aangerekend te vermeerderen met 2%.)', 25),
(359, 39, 'Bijzondere voorwaarden', '[placeholder:contract_special_conditions]', 26),
(360, 39, 'Keuze van woonplaats', 'Voor de uitvoering van onderhavige overeenkomst kiezen de partijen woonplaats op hun bovengenoemde adres en indien ze niet in België verblijven op het kantoor van de door hen aangewezen notaris.', 27),
(361, 39, 'Bemiddeling (facultatief)', 'Onderhavige verkoop is gesloten door bemiddeling van: [placeholder:contract_broker_name]', 28),
(362, 39, 'Opgemaakt te', 'Opgemaakt te [placeholder:contract_place_of_signature] op [placeholder:contract_date_of_signature] in zoveel exemplaren als er partijen zijn.\nElke partij verklaart hierbij een exemplaar te hebben ontvangen.\nVoor ondertekening\nDe verkoper                           De koper\n(Gelieve elke bladzijde en elke eventuele schrapping te paraferen)', 29),
(363, 39, 'Bijlagen', '- Kopie eigendomstitel\n- Bodemattest\n- Energieprestatiecertificaat\n- Stedenbouwkundige vergunning (eventueel)\n- Verkavelingsvergunning (eventueel)\n- As-builtattest (eventueel)\n- Keuringsattest stookolietank (eventueel)\n- Huurovereenkomst (eventueel)\n- Andere: [placeholder:annex_other_documents]', 30),
(364, 39, 'Opgemaakt door/Aangepast door', 'Deze overeenkomst werd opgemaakt door\nVerbruikersunie Test-Aankoop\nHollandstraat 13, 1060 Brussel\nKoninklijke Federatie van Belgische Notarissen\nBergstraat 30-32, 1000 Brussel\nVlaamse Vastgoedfederatie\nMozartstraat 24/11, 2018 Antwerpen\nUnie der Immobiliënberoepen van België\nAlbertlaan 29, 1190 Brussel\nConfederatie van Immobiliënberoepen van België\nWaterloosesteenweg 715/32, 1180 Brussel\nAangepast door Test-Aankoop\nin maart 2014', 31);

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `SectiePlaceholder`
--

CREATE TABLE `SectiePlaceholder` (
  `sectie_id` int NOT NULL,
  `placeholder_id` int NOT NULL,
  `pdf_label` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Gegevens worden geëxporteerd voor tabel `SectiePlaceholder`
--

INSERT INTO `SectiePlaceholder` (`sectie_id`, `placeholder_id`, `pdf_label`) VALUES
(1, 1, NULL),
(1, 2, NULL),
(1, 3, NULL),
(1, 4, NULL),
(1, 5, NULL),
(1, 6, NULL),
(1, 7, NULL),
(1, 8, NULL),
(1, 9, NULL),
(1, 10, NULL),
(1, 11, NULL),
(196, 12, 'buyer1_firstname'),
(196, 13, 'buyer1_lastname'),
(196, 14, 'buyer1_birthplace'),
(196, 15, 'buyer1_birthdate'),
(196, 16, 'buyer1_address'),
(196, 17, 'buyer2_firstname'),
(196, 18, 'buyer2_lastname'),
(196, 19, 'buyer2_birthplace'),
(196, 20, 'buyer2_birthdate'),
(196, 21, 'buyer2_address'),
(196, 22, 'buyers_marital_status'),
(284, 12, 'Voornaam koper 1'),
(284, 13, 'Achternaam koper 1'),
(284, 14, 'Geboorteplaats koper 1'),
(284, 15, 'Geboortedatum koper 1'),
(284, 16, 'buyer1_address'),
(284, 17, 'Voornaam koper 2'),
(284, 18, 'Achternaam koper 2'),
(284, 19, 'Geboorteplaats koper 2'),
(284, 20, 'Geboortedatum koper 2'),
(284, 22, 'buyers_marital_status'),
(284, 132, 'seller1_full_name'),
(284, 133, 'seller1_birthplace'),
(284, 134, 'seller1_birthdate'),
(284, 135, 'seller1_address'),
(285, 25, 'property_municipality1'),
(285, 26, 'property_municipality2'),
(285, 136, 'property_detailed_description'),
(285, 137, 'property_cadastral_section'),
(285, 138, 'property_cadastral_number'),
(285, 139, 'property_cadastral_surface'),
(290, 50, 'zoning_plan_name'),
(290, 51, 'zoning_destination'),
(293, 52, 'price_total'),
(293, 59, 'Voorschot'),
(293, 60, 'deposit_account'),
(293, 61, 'deposit_account_holder'),
(293, 112, 'contract_termination_penalty'),
(294, 87, 'notary_seller_office'),
(294, 89, 'notary_authentic_act_deadline'),
(296, 92, 'contract_place_of_signature'),
(296, 93, 'contract_date_of_signature'),
(311, 12, 'Voornaam van koper 1'),
(311, 13, 'Achternaam van koper 1'),
(311, 14, 'Geboorteplaats van koper 1'),
(311, 15, 'Geboortedatum van koper 1'),
(311, 16, 'Adres van koper 1'),
(311, 17, 'Voornaam van koper 2'),
(311, 18, 'Achternaam van koper 2'),
(311, 19, 'Geboorteplaats van koper 2'),
(311, 20, 'Geboortedatum van koper 2'),
(311, 22, 'Huwelijksstelsel van de kopers'),
(311, 132, 'Volledige naam verkoper 1'),
(311, 133, 'Geboorteplaats verkoper 1'),
(311, 134, 'Geboortedatum verkoper 1'),
(311, 135, 'Adres verkoper 1'),
(313, 25, 'Eerste gemeente waarin het goed ligt'),
(313, 26, 'Tweede gemeente waarin het goed ligt (eventueel voormalige)'),
(313, 136, 'Gedetailleerde beschrijving van het goed (type, ligging)'),
(313, 137, 'Kadastrale sectie'),
(313, 138, 'Kadastraal nummer'),
(313, 139, 'Kadastrale oppervlakte'),
(317, 51, 'Stedenbouwkundige bestemming volgens plannenregister'),
(317, 140, 'Naam van het gewestplan of RUP'),
(320, 52, 'Totaalprijs van de verkoop'),
(320, 59, 'Voorschotbedrag'),
(320, 60, 'Rekeningnummer waarop het voorschot werd betaald'),
(320, 61, 'Naam van de rekeninghouder'),
(320, 112, 'Schadevergoeding bij ontbinding'),
(320, 141, 'Percentage vertragingsvergoeding per jaar'),
(321, 87, 'Adres van de notaris van de verkoper (of gedeelde notaris)'),
(321, 89, 'Deadline voor verlijden van de akte'),
(321, 142, 'Naam van de instrumenterende notaris (gedeeld)'),
(322, 143, 'Termijn voor communicatie bodemattest aan koper'),
(323, 144, 'Maximale verzekerde som per gebeurtenis'),
(323, 145, 'Maximale duur dekking in maanden'),
(324, 92, 'Plaats van ondertekening van de compromis'),
(324, 93, 'Datum van ondertekening van de compromis'),
(333, 12, 'Voornaam koper'),
(333, 13, 'Achternaam koper'),
(333, 16, 'Adres, beroep en BTW-nummer koper'),
(333, 24, 'Straat en nummer van het gebouw'),
(333, 25, 'Gemeente'),
(333, 132, 'Naam en voornamen verkoper'),
(333, 135, 'Adres, beroep en BTW-nummer verkoper'),
(333, 137, 'Kadastrale sectie'),
(333, 138, 'Kadastraal nummer'),
(333, 139, 'Kadastrale oppervlakte'),
(333, 146, 'Niet-geïndexeerd kadastraal inkomen'),
(340, 147, 'Type verhuur (bv. hoofdverblijfplaats)'),
(340, 148, 'Maandelijkse huurprijs'),
(340, 149, 'Startdatum huurovereenkomst'),
(342, 44, 'Datum stedenbouwkundige vergunning'),
(342, 51, 'Meest recente stedenbouwkundige bestemming'),
(342, 150, 'Datum verkavelingsvergunning'),
(342, 151, 'Begunstigde recht van voorkoop'),
(344, 78, 'Datum van het OVAM bodemattest'),
(344, 80, 'Inhoud/Status van het bodemattest (OVAM)'),
(345, 152, 'Datum van het BIM bodemattest'),
(345, 153, 'Inhoud/Status van het bodemattest (BIM)'),
(349, 86, 'Datum elektriciteitskeuring'),
(351, 77, 'EPC score/gegevens'),
(355, 91, 'Deadline voor verwezenlijking hypothecair krediet'),
(355, 154, 'Maximaal financieringspercentage van de verkoopprijs'),
(356, 52, 'Totaalprijs van de verkoop'),
(356, 59, 'Voorschot/waarborg bedrag'),
(356, 60, 'Rekeningnummer voor voorschot/waarborg'),
(357, 87, 'Adres van de notaris van de verkoper'),
(357, 88, 'Adres van de notaris van de koper'),
(357, 89, 'Deadline voor verlijden van de notariële akte'),
(357, 142, 'Naam gezamenlijke notaris'),
(357, 155, 'Adres gezamenlijke notaris'),
(357, 156, 'Naam notaris verkoper'),
(357, 157, 'Naam notaris koper'),
(358, 141, 'Jaarlijks percentage vertragingsrente'),
(359, 158, 'Bijzondere voorwaarden'),
(361, 115, 'Naam van de bemiddelaar'),
(362, 92, 'Plaats van ondertekening van de compromis'),
(362, 93, 'Datum van ondertekening van de compromis'),
(363, 159, 'Andere bij te voegen documenten');

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `Template`
--

CREATE TABLE `Template` (
  `template_id` int NOT NULL,
  `naam` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `sections` json DEFAULT NULL,
  `is_ai_suggested` tinyint(1) DEFAULT '0',
  `ui_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `source` varchar(50) DEFAULT 'Custom',
  `is_archived` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Gegevens worden geëxporteerd voor tabel `Template`
--

INSERT INTO `Template` (`template_id`, `naam`, `title`, `description`, `sections`, `is_ai_suggested`, `ui_id`, `created_at`, `source`, `is_archived`) VALUES
(1, 'Standaard Verkoopsovereenkomst (Vlaanderen)', 'Standaard Verkoopsovereenkomst (Vlaanderen)', 'Geschikt voor residentiële verkoop in het Vlaamse Gewest.', '[]', 1, 'verkoop-vlaanderen-2024', '2025-12-24 07:10:16', 'CIB', 0),
(2, 'CIB huis', 'CIB huis', 'Modeldocument voor huizenverkoop in Vlaanderen', '[{\"id\": \"sec-1766657939131\", \"title\": \"Nieuwe Sectie\", \"content\": \"\", \"isApproved\": false, \"placeholders\": []}]', 0, 'verkoop-brussel-2024', '2025-12-24 07:10:16', 'CIB', 0),
(3, 'Compromis de Vente (Wallonie)', 'Compromis de Vente (Wallonie)', 'Modeldocument voor verkoop in Wallonië.qdsf', '[{\"id\": \"sec-1766660206522\", \"title\": \"Nieuwe Sectie\", \"content\": \"\", \"isApproved\": false, \"placeholders\": []}]', 0, 'verkoop-wallonie-2024', '2025-12-24 07:10:16', 'CIB', 0),
(33, 'Huis Willem deftig', 'Text extractie van huis - Copy', 'Dit is een heel goede geextraheerde versie van Willem\'s template. ', NULL, 0, NULL, '2025-12-28 13:55:20', 'Custom', 0),
(34, 'Huis Willem ', 'Huis Willem ', '', NULL, 0, NULL, '2025-12-31 13:14:41', 'Custom', 0),
(39, 'Koop-verkoopovereenkomst woning_2018 TEST_AANKOOP', 'Koop-verkoopovereenkomst woning_2018 TEST_AANKOOP', '', NULL, 0, NULL, '2026-01-05 14:28:08', 'Custom', 0),
(45, 'Koop-verkoopovereenkomst woning_2018 TEST_AANKOOP', 'Koop-verkoopovereenkomst woning_2018 TEST_AANKOOP', '', NULL, 0, NULL, '2026-01-07 16:14:42', 'Custom', 0),
(46, 'Debug Template Test', 'Debug Template Test', 'Test upload via script', NULL, 0, NULL, '2026-01-07 16:18:03', 'Custom', 1);

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `TimelineEvent`
--

CREATE TABLE `TimelineEvent` (
  `id` int NOT NULL,
  `ui_id` varchar(50) DEFAULT NULL,
  `dossier_id` int NOT NULL,
  `event_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `user_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Gegevens worden geëxporteerd voor tabel `TimelineEvent`
--

INSERT INTO `TimelineEvent` (`id`, `ui_id`, `dossier_id`, `event_date`, `title`, `description`, `user_name`) VALUES
(50, NULL, 24, '2025-12-28 14:02:21', 'Dossier aangemaakt', 'Dossier \"Appartement Jan Janssens\" is succesvol aangemaakt met 1 documenten.', 'Systeem'),
(51, NULL, 24, '2025-12-28 14:02:21', 'AI Analyse: PDF inlezen', 'Tekst extraheren uit Text extractie van huis - Copy.pdf...', 'AI Assistent'),
(52, NULL, 24, '2025-12-28 14:02:22', 'AI Analyse: Gegevens zoeken', 'Gemini analyseert Text extractie van huis - Copy.pdf (16833 tekens)...', 'AI Assistent'),
(53, NULL, 24, '2025-12-28 14:02:39', 'AI Analyse Voltooid', 'AI heeft de documenten geanalyseerd en 42 velden ingevuld of bijgewerkt.', 'AI Assistent'),
(70, NULL, 33, '2026-01-06 15:38:02', 'Dossier aangemaakt', 'Dossier \"qslkdfgs\" is succesvol aangemaakt met 1 documenten.', 'Systeem'),
(71, NULL, 33, '2026-01-06 15:38:02', 'AI Analyse: PDF inlezen', 'Tekst extraheren uit Text extractie van huis - Copy.pdf...', 'AI Assistent'),
(72, NULL, 33, '2026-01-06 15:38:03', 'AI Analyse: Gegevens zoeken', 'Gemini analyseert Text extractie van huis - Copy.pdf (16833 tekens)...', 'AI Assistent'),
(73, NULL, 33, '2026-01-06 15:38:03', 'AI Analyse Voltooid', 'AI heeft de documenten geanalyseerd en 0 velden ingevuld of bijgewerkt.', 'AI Assistent'),
(75, NULL, 35, '2026-01-13 19:48:12', 'Dossier aangemaakt', 'Dossier \"Stefaan heeft Haar \" is succesvol aangemaakt met 0 documenten.', 'Systeem'),
(76, NULL, 36, '2026-01-13 19:49:41', 'Dossier aangemaakt', 'Dossier \"reqgrbh\" is succesvol aangemaakt met 1 documenten.', 'Systeem'),
(77, NULL, 36, '2026-01-13 19:49:41', 'AI Analyse: PDF inlezen', 'Tekst extraheren uit Text extractie van huis - Copy.pdf...', 'AI Assistent'),
(78, NULL, 36, '2026-01-13 19:49:42', 'AI Analyse: Gegevens zoeken', 'Gemini analyseert Text extractie van huis - Copy.pdf (16833 tekens)...', 'AI Assistent'),
(79, NULL, 36, '2026-01-13 19:49:56', 'AI Analyse Voltooid', 'AI heeft de documenten geanalyseerd en 41 velden ingevuld of bijgewerkt.', 'AI Assistent');

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `Transactie`
--

CREATE TABLE `Transactie` (
  `transactie_id` int NOT NULL,
  `account_id` int NOT NULL,
  `provider_id` int DEFAULT NULL,
  `bedrag` decimal(10,2) NOT NULL,
  `valuta` varchar(3) DEFAULT 'EUR',
  `datum` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `betaalstatus` varchar(50) DEFAULT NULL,
  `betaalmethode` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `Verkoopsovereenkomst`
--

CREATE TABLE `Verkoopsovereenkomst` (
  `overeenkomst_id` int NOT NULL,
  `ui_id` varchar(50) DEFAULT NULL,
  `dossier_id` int NOT NULL,
  `template_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Gegevens worden geëxporteerd voor tabel `Verkoopsovereenkomst`
--

INSERT INTO `Verkoopsovereenkomst` (`overeenkomst_id`, `ui_id`, `dossier_id`, `template_id`, `created_at`) VALUES
(30, 'agg-1766930578413', 24, 33, '2025-12-28 14:02:59'),
(32, 'agg-1767355027288', 24, 34, '2026-01-02 11:57:07'),
(40, 'agg-1767713899276', 33, 39, '2026-01-06 15:38:19'),
(41, 'agg-1768333759540', 35, 45, '2026-01-13 19:49:19'),
(42, 'agg-1768333812830', 36, 45, '2026-01-13 19:50:13'),
(43, 'agg-1768333818864', 36, 34, '2026-01-13 19:50:19'),
(44, 'agg-1768333901012', 36, 45, '2026-01-13 19:51:41'),
(45, 'agg-1768333906357', 36, 39, '2026-01-13 19:51:46');

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `Versie`
--

CREATE TABLE `Versie` (
  `versie_id` int NOT NULL,
  `ui_id` varchar(50) DEFAULT NULL,
  `overeenkomst_id` int NOT NULL,
  `versie_nummer` varchar(20) NOT NULL,
  `sections` json DEFAULT NULL,
  `file_path` varchar(512) DEFAULT NULL,
  `source` enum('AI','Upload','Manual') DEFAULT 'Manual',
  `is_current` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Gegevens worden geëxporteerd voor tabel `Versie`
--

INSERT INTO `Versie` (`versie_id`, `ui_id`, `overeenkomst_id`, `versie_nummer`, `sections`, `file_path`, `source`, `is_current`, `created_at`) VALUES
(31, 'ver-1766930578474', 30, '1.0', NULL, NULL, 'AI', 1, '2025-12-28 14:02:59'),
(33, 'ver-1767355027352', 32, '3.0', NULL, NULL, 'AI', 1, '2026-01-02 11:57:07'),
(41, 'ver-1767713899361', 40, '1.0', NULL, NULL, 'AI', 1, '2026-01-06 15:38:19'),
(42, 'ver-1768333759611', 41, '1.0', NULL, NULL, 'AI', 1, '2026-01-13 19:49:19'),
(43, 'ver-1768333812938', 42, '1.0', NULL, NULL, 'AI', 1, '2026-01-13 19:50:13'),
(44, 'ver-1768333818985', 43, '2.0', NULL, NULL, 'AI', 1, '2026-01-13 19:50:19'),
(45, 'ver-1768333901088', 44, '3.0', NULL, NULL, 'AI', 1, '2026-01-13 19:51:41'),
(46, 'ver-1768333906427', 45, '4.0', NULL, NULL, 'AI', 1, '2026-01-13 19:51:46');

--
-- Indexen voor geëxporteerde tabellen
--

--
-- Indexen voor tabel `AangepastePlaceholder`
--
ALTER TABLE `AangepastePlaceholder`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_dossier_placeholder` (`dossier_id`,`placeholder_id`),
  ADD KEY `placeholder_id` (`placeholder_id`);

--
-- Indexen voor tabel `AangepasteSectie`
--
ALTER TABLE `AangepasteSectie`
  ADD PRIMARY KEY (`aangepaste_sectie_id`),
  ADD KEY `versie_id` (`versie_id`),
  ADD KEY `AangepasteSectie_ibfk_2` (`sectie_id`);

--
-- Indexen voor tabel `Account`
--
ALTER TABLE `Account`
  ADD PRIMARY KEY (`account_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexen voor tabel `Documenten`
--
ALTER TABLE `Documenten`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `dossier_id` (`dossier_id`);

--
-- Indexen voor tabel `Dossier`
--
ALTER TABLE `Dossier`
  ADD PRIMARY KEY (`dossier_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexen voor tabel `PlaceholderLibrary`
--
ALTER TABLE `PlaceholderLibrary`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sleutel` (`sleutel`);

--
-- Indexen voor tabel `Provider`
--
ALTER TABLE `Provider`
  ADD PRIMARY KEY (`provider_id`);

--
-- Indexen voor tabel `Sectie`
--
ALTER TABLE `Sectie`
  ADD PRIMARY KEY (`sectie_id`),
  ADD KEY `template_id` (`template_id`);

--
-- Indexen voor tabel `SectiePlaceholder`
--
ALTER TABLE `SectiePlaceholder`
  ADD PRIMARY KEY (`sectie_id`,`placeholder_id`),
  ADD KEY `placeholder_id` (`placeholder_id`);

--
-- Indexen voor tabel `Template`
--
ALTER TABLE `Template`
  ADD PRIMARY KEY (`template_id`),
  ADD UNIQUE KEY `ui_id` (`ui_id`);

--
-- Indexen voor tabel `TimelineEvent`
--
ALTER TABLE `TimelineEvent`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dossier_id` (`dossier_id`);

--
-- Indexen voor tabel `Transactie`
--
ALTER TABLE `Transactie`
  ADD PRIMARY KEY (`transactie_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `provider_id` (`provider_id`);

--
-- Indexen voor tabel `Verkoopsovereenkomst`
--
ALTER TABLE `Verkoopsovereenkomst`
  ADD PRIMARY KEY (`overeenkomst_id`),
  ADD UNIQUE KEY `ui_id` (`ui_id`),
  ADD KEY `dossier_id` (`dossier_id`),
  ADD KEY `template_id` (`template_id`);

--
-- Indexen voor tabel `Versie`
--
ALTER TABLE `Versie`
  ADD PRIMARY KEY (`versie_id`),
  ADD UNIQUE KEY `ui_id` (`ui_id`),
  ADD KEY `overeenkomst_id` (`overeenkomst_id`);

--
-- AUTO_INCREMENT voor geëxporteerde tabellen
--

--
-- AUTO_INCREMENT voor een tabel `AangepastePlaceholder`
--
ALTER TABLE `AangepastePlaceholder`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1933;

--
-- AUTO_INCREMENT voor een tabel `AangepasteSectie`
--
ALTER TABLE `AangepasteSectie`
  MODIFY `aangepaste_sectie_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=558;

--
-- AUTO_INCREMENT voor een tabel `Account`
--
ALTER TABLE `Account`
  MODIFY `account_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT voor een tabel `Documenten`
--
ALTER TABLE `Documenten`
  MODIFY `document_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT voor een tabel `Dossier`
--
ALTER TABLE `Dossier`
  MODIFY `dossier_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT voor een tabel `PlaceholderLibrary`
--
ALTER TABLE `PlaceholderLibrary`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=160;

--
-- AUTO_INCREMENT voor een tabel `Provider`
--
ALTER TABLE `Provider`
  MODIFY `provider_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `Sectie`
--
ALTER TABLE `Sectie`
  MODIFY `sectie_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=365;

--
-- AUTO_INCREMENT voor een tabel `Template`
--
ALTER TABLE `Template`
  MODIFY `template_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT voor een tabel `TimelineEvent`
--
ALTER TABLE `TimelineEvent`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT voor een tabel `Transactie`
--
ALTER TABLE `Transactie`
  MODIFY `transactie_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `Verkoopsovereenkomst`
--
ALTER TABLE `Verkoopsovereenkomst`
  MODIFY `overeenkomst_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT voor een tabel `Versie`
--
ALTER TABLE `Versie`
  MODIFY `versie_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- Beperkingen voor geëxporteerde tabellen
--

--
-- Beperkingen voor tabel `AangepastePlaceholder`
--
ALTER TABLE `AangepastePlaceholder`
  ADD CONSTRAINT `AangepastePlaceholder_ibfk_1` FOREIGN KEY (`dossier_id`) REFERENCES `Dossier` (`dossier_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `AangepastePlaceholder_ibfk_2` FOREIGN KEY (`placeholder_id`) REFERENCES `PlaceholderLibrary` (`id`) ON DELETE CASCADE;

--
-- Beperkingen voor tabel `AangepasteSectie`
--
ALTER TABLE `AangepasteSectie`
  ADD CONSTRAINT `AangepasteSectie_ibfk_1` FOREIGN KEY (`versie_id`) REFERENCES `Versie` (`versie_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `AangepasteSectie_ibfk_2` FOREIGN KEY (`sectie_id`) REFERENCES `Sectie` (`sectie_id`);

--
-- Beperkingen voor tabel `Documenten`
--
ALTER TABLE `Documenten`
  ADD CONSTRAINT `Documenten_ibfk_1` FOREIGN KEY (`dossier_id`) REFERENCES `Dossier` (`dossier_id`) ON DELETE CASCADE;

--
-- Beperkingen voor tabel `Dossier`
--
ALTER TABLE `Dossier`
  ADD CONSTRAINT `Dossier_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `Account` (`account_id`);

--
-- Beperkingen voor tabel `Sectie`
--
ALTER TABLE `Sectie`
  ADD CONSTRAINT `Sectie_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `Template` (`template_id`) ON DELETE CASCADE;

--
-- Beperkingen voor tabel `SectiePlaceholder`
--
ALTER TABLE `SectiePlaceholder`
  ADD CONSTRAINT `SectiePlaceholder_ibfk_1` FOREIGN KEY (`sectie_id`) REFERENCES `Sectie` (`sectie_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `SectiePlaceholder_ibfk_2` FOREIGN KEY (`placeholder_id`) REFERENCES `PlaceholderLibrary` (`id`) ON DELETE CASCADE;

--
-- Beperkingen voor tabel `TimelineEvent`
--
ALTER TABLE `TimelineEvent`
  ADD CONSTRAINT `TimelineEvent_ibfk_1` FOREIGN KEY (`dossier_id`) REFERENCES `Dossier` (`dossier_id`) ON DELETE CASCADE;

--
-- Beperkingen voor tabel `Transactie`
--
ALTER TABLE `Transactie`
  ADD CONSTRAINT `Transactie_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `Account` (`account_id`),
  ADD CONSTRAINT `Transactie_ibfk_2` FOREIGN KEY (`provider_id`) REFERENCES `Provider` (`provider_id`);

--
-- Beperkingen voor tabel `Verkoopsovereenkomst`
--
ALTER TABLE `Verkoopsovereenkomst`
  ADD CONSTRAINT `Verkoopsovereenkomst_ibfk_1` FOREIGN KEY (`dossier_id`) REFERENCES `Dossier` (`dossier_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Verkoopsovereenkomst_ibfk_2` FOREIGN KEY (`template_id`) REFERENCES `Template` (`template_id`) ON DELETE SET NULL;

--
-- Beperkingen voor tabel `Versie`
--
ALTER TABLE `Versie`
  ADD CONSTRAINT `Versie_ibfk_1` FOREIGN KEY (`overeenkomst_id`) REFERENCES `Verkoopsovereenkomst` (`overeenkomst_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
