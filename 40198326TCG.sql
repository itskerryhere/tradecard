-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: May 03, 2024 at 05:24 AM
-- Server version: 5.7.39
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `40198326TCG`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_request`
--

CREATE TABLE `admin_request` (
  `admin_request_id` int(11) NOT NULL,
  `admin_request_status` varchar(255) NOT NULL DEFAULT 'Pending',
  `request_response_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `admin_request`
--

INSERT INTO `admin_request` (`admin_request_id`, `admin_request_status`, `request_response_timestamp`, `user_id`) VALUES
(2, 'Pending', '2024-05-02 01:35:12', 61);

-- --------------------------------------------------------

--
-- Table structure for table `attack`
--

CREATE TABLE `attack` (
  `attack_id` int(11) NOT NULL,
  `attack_name` varchar(255) NOT NULL,
  `attack_description` text NOT NULL,
  `attack_damage` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `attack`
--

INSERT INTO `attack` (`attack_id`, `attack_name`, `attack_description`, `attack_damage`) VALUES
(3, 'Guard Press', 'During your opponent\'s next turn, this Pokémon takes 30 less damage from attacks (after applying Weakness and Resistance).', 10),
(6, 'Slash', '', 20),
(7, 'Leaf Step', '', 60),
(8, 'Trick Cape', 'You may put an Energy attached to your opponent\'s Active Pokémon into their hand.', 40),
(9, 'Flower Blast', '', 130),
(10, 'Gnaw', '', 10),
(11, 'Combustion', '', 50),
(12, 'Bite', '', 50),
(13, 'Rolling Tackle', '', 100),
(14, 'Passionate Singing', 'Attach up to 2 Basic Energy cards from your discard pile to your Pokémon in any way you like.', 50),
(15, 'Blazing Shout', 'This Pokémon also does 30 damage to itself.', 190),
(46, 'Twisting Strike', 'Flip a coin. If heads, during your opponent\'s next turn, prevent all damage from and effects of attacks done to this Pokémon.', 10),
(47, 'Dig a Little', 'Flip a coin. If heads, discard the top card of your opponent\'s deck.', 0),
(48, 'Ram', '', 20),
(49, 'Headbutt', '', 30),
(50, 'Undersea Tunnel', 'Flip 3 coins. For each heads, discard the top 3 cards of your opponent\'s deck.', 0),
(51, 'Random Spark', 'This attack does 10 damage to 1 of your opponent\'s Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)', 0),
(53, 'Collateral Bolts', 'This attack does 50 damage to each Pokémon that has any damage counters on it (both yours and your opponent\'s) , except for this Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)', 0),
(54, 'Electric Ball', '', 120),
(56, 'Mini Drain', 'Heal 10 damage from this Pokémon.', 10),
(57, 'Plentiful Pollen', 'During your next turn, if the Defending Pokémon is Knocked Out, take 2 more Prize cards.', 30),
(58, 'Energy Mix', 'Search your deck for an Energy card and attach it to 1 of your Fusion Strike Pokémon. Then, shuffle your deck.', 0),
(59, 'Psychic Leap', 'You may shuffle this Pokémon and all attached cards into your deck.', 70),
(60, 'Body Slam', 'Flip a coin. If heads, your opponent\'s Active Pokémon is now Paralyzed.', 40),
(61, 'Nom-Nom-Nom Incisors', 'Draw 3 cards.', 120),
(62, 'Gather Flowers', 'Shuffle up to 2 Energy cards from your discard pile into your deck.', 0),
(63, 'Rear Kick', '', 30),
(66, 'Bite', '', 20),
(67, 'Dredge Up', 'Discard the top 3 cards of your opponent\'s deck.', 0),
(68, 'Cotton Guard', 'During your opponent\'s next turn, this Pokémon takes 10 less damage from attacks (after applying Weakness and Resistance).', 10),
(69, 'Olfactory Enchantment', 'Your opponent\'s Active Pokémon is now Confused.', 0),
(70, 'Sweet Panic', 'If your opponent\'s Active Pokémon isn\'t Confused, this attack does nothing.', 110),
(71, 'Bedrock Press', 'During your opponent\'s next turn, this Pokémon takes 20 less damage from attacks (after applying Weakness and Resistance).', 20),
(72, 'Ground Stream', 'Attach 2 Fighting Energy cards from your discard pile to this Pokémon.', 20),
(73, 'Gigaton Shake', 'During your next turn, your Pokémon can\'t attack. (This includes Pokémon that come into play on that turn.)', 220),
(94, 'Scratch', '', 10),
(98, 'Hammer In', '', 50),
(99, 'Heavy Hold', 'The Defending Pokémon can\'t attack during your opponent\'s next turn.', 120),
(128, 'Leafage', '', 20);

-- --------------------------------------------------------

--
-- Table structure for table `attack_type`
--

CREATE TABLE `attack_type` (
  `attack_type_id` int(11) NOT NULL,
  `attack_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `strength` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `card`
--

CREATE TABLE `card` (
  `card_id` int(11) NOT NULL,
  `pokemon_name` varchar(255) NOT NULL,
  `card_img_url` varchar(2048) NOT NULL,
  `card_hp` int(11) NOT NULL,
  `pokedex_num` int(11) NOT NULL,
  `evolves_from` varchar(255) NOT NULL,
  `holo` tinyint(1) NOT NULL,
  `rarity_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `stage_id` int(11) NOT NULL,
  `weakness_id` int(11) NOT NULL,
  `expansion_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `card`
--

INSERT INTO `card` (`card_id`, `pokemon_name`, `card_img_url`, `card_hp`, `pokedex_num`, `evolves_from`, `holo`, `rarity_id`, `type_id`, `stage_id`, `weakness_id`, `expansion_id`) VALUES
(1, 'Pineco', 'https://assets.tcgdex.net/en/sv/sv01/001/high.webp', 60, 204, '', 0, 1, 6, 1, 3, 1),
(2, 'Sprigatito', 'https://assets.tcgdex.net/en/sv/sv01/013/high.webp', 70, 906, '', 0, 1, 6, 1, 3, 1),
(3, 'Floragato', 'https://assets.tcgdex.net/en/sv/sv01/014/high.webp', 90, 907, 'Sprigatito', 0, 2, 6, 2, 3, 1),
(4, 'Meowscarada', 'https://assets.tcgdex.net/en/sv/sv01/015/high.webp', 160, 908, 'Floragato', 0, 3, 6, 3, 3, 1),
(5, 'Fuecoco', 'https://assets.tcgdex.net/en/sv/sv01/036/high.webp', 80, 909, '', 0, 1, 3, 1, 11, 1),
(6, 'Crocalor', 'https://assets.tcgdex.net/en/sv/sv01/037/high.webp', 100, 910, 'Fuecoco', 0, 2, 3, 2, 11, 1),
(7, 'Skeledirge', 'https://assets.tcgdex.net/en/sv/sv01/038/high.webp', 180, 911, 'Crocalor', 0, 3, 3, 3, 11, 1),
(15, 'Wiglett', 'https://assets.tcgdex.net/en/sv/sv01/055/high.webp', 50, 960, '', 0, 1, 11, 1, 4, 1),
(16, 'Wiglett', 'https://assets.tcgdex.net/en/sv/sv01/056/high.webp', 60, 960, '', 0, 1, 11, 1, 4, 1),
(17, 'Wugtrio', 'https://assets.tcgdex.net/en/sv/sv01/057/high.webp', 90, 961, 'Wiglett', 0, 2, 11, 2, 4, 1),
(18, 'Pikachu', 'https://assets.tcgdex.net/en/sv/sv05/051/high.webp', 70, 25, '', 0, 1, 4, 1, 7, 2),
(19, 'Raichu', 'https://assets.tcgdex.net/en/sv/sv05/052/high.webp', 130, 26, 'Pikachu', 0, 1, 4, 2, 7, 2),
(20, 'Cutiefly', 'https://assets.tcgdex.net/en/sv/sv05/075/high.webp', 30, 742, '', 0, 1, 5, 1, 8, 2),
(21, 'Ribombee', 'https://assets.tcgdex.net/en/sv/sv05/076/high.webp', 70, 743, 'Cutiefly', 0, 2, 5, 2, 8, 2),
(22, 'Mew V', 'https://assets.tcgdex.net/en/swsh/swsh12.5/060/high.webp', 180, 151, '', 1, 3, 5, 1, 9, 3),
(23, 'Greedent V', 'https://assets.tcgdex.net/en/swsh/swsh12.5/120/high.webp', 210, 820, '', 1, 3, 1, 1, 7, 3),
(24, 'Shaymin', 'https://assets.tcgdex.net/en/swsh/swsh12.5/115/high.webp', 70, 492, '', 0, 2, 1, 1, 4, 3),
(25, 'Krokorok', 'https://assets.tcgdex.net/en/swsh/swsh12.5/079/high.webp', 90, 552, 'Sandile', 0, 2, 9, 2, 6, 3),
(26, 'Swirlix', 'https://assets.tcgdex.net/en/sm/sm12/153/high.webp', 60, 684, '', 0, 1, 2, 1, 8, 4),
(27, 'Slurpuff', 'https://assets.tcgdex.net/en/sm/sm12/154/high.webp', 110, 685, 'Swirlix', 0, 3, 2, 2, 8, 4),
(28, 'Onix', 'https://assets.tcgdex.net/en/sm/sm11/103/high.webp', 110, 95, '', 0, 1, 7, 1, 6, 5),
(29, 'Steelix', 'https://assets.tcgdex.net/en/sm/sm11/104/high.webp', 170, 208, 'Onix', 0, 3, 7, 2, 6, 5),
(32, 'Teddiursa', 'https://assets.tcgdex.net/en/sm/sm12/171/high.webp', 60, 216, '', 0, 1, 1, 1, 7, 4),
(33, 'Ursaring', 'https://assets.tcgdex.net/en/sm/sm12/172/high.webp', 140, 217, 'Teddiursa', 0, 3, 1, 2, 7, 4);

-- --------------------------------------------------------

--
-- Table structure for table `card_attack`
--

CREATE TABLE `card_attack` (
  `card_attack_id` int(11) NOT NULL,
  `card_id` int(11) NOT NULL,
  `attack_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `card_attack`
--

INSERT INTO `card_attack` (`card_attack_id`, `card_id`, `attack_id`) VALUES
(1, 4, 8),
(2, 4, 9),
(3, 3, 6),
(4, 3, 7),
(8, 5, 10),
(10, 6, 12),
(11, 6, 13),
(22, 15, 46),
(23, 16, 47),
(24, 16, 48),
(25, 17, 49),
(26, 17, 50),
(27, 7, 14),
(28, 7, 15),
(29, 18, 51),
(30, 19, 53),
(31, 19, 54),
(32, 20, 56),
(33, 21, 57),
(34, 22, 58),
(35, 22, 59),
(36, 23, 60),
(37, 23, 61),
(38, 24, 62),
(39, 24, 63),
(40, 25, 66),
(41, 25, 67),
(42, 26, 68),
(43, 27, 69),
(44, 27, 70),
(45, 28, 71),
(46, 29, 72),
(47, 29, 73),
(68, 1, 3),
(128, 32, 94),
(129, 32, 6),
(130, 33, 98),
(131, 33, 99),
(132, 5, 11),
(215, 2, 94),
(216, 2, 128);

-- --------------------------------------------------------

--
-- Table structure for table `card_collection`
--

CREATE TABLE `card_collection` (
  `card_collection_id` int(11) NOT NULL,
  `card_id` int(11) NOT NULL,
  `collection_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `card_collection`
--

INSERT INTO `card_collection` (`card_collection_id`, `card_id`, `collection_id`) VALUES
(1, 32, 43),
(3, 23, 43),
(4, 15, 46),
(5, 16, 46);

-- --------------------------------------------------------

--
-- Table structure for table `collection`
--

CREATE TABLE `collection` (
  `collection_id` int(11) NOT NULL,
  `collection_name` varchar(255) NOT NULL,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `like_count` int(11) NOT NULL DEFAULT '0',
  `collection_logo_type_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `collection`
--

INSERT INTO `collection` (`collection_id`, `collection_name`, `creation_date`, `like_count`, `collection_logo_type_id`, `user_id`) VALUES
(43, 'My First Collection', '2024-04-28 16:32:16', 0, 1, 45),
(46, 'Wiglett Only', '2024-04-28 17:05:22', 0, 11, 45),
(53, 'I love all pokemons', '2024-05-02 01:36:16', 0, 4, 61);

-- --------------------------------------------------------

--
-- Table structure for table `comment`
--

CREATE TABLE `comment` (
  `comment_id` int(11) NOT NULL,
  `comment_text` text NOT NULL,
  `comment_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int(11) NOT NULL,
  `collection_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `comment`
--

INSERT INTO `comment` (`comment_id`, `comment_text`, `comment_timestamp`, `user_id`, `collection_id`) VALUES
(17, 'Look at my first ever collection! Leave a LIKE and COMMENT!', '2024-04-28 17:21:21', 45, 43),
(25, 'I love your pokemons', '2024-05-02 02:10:59', 45, 53);

-- --------------------------------------------------------

--
-- Table structure for table `expansion`
--

CREATE TABLE `expansion` (
  `expansion_id` int(11) NOT NULL,
  `expansion_name` varchar(255) NOT NULL,
  `expansion_release_date` date NOT NULL,
  `series_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `expansion`
--

INSERT INTO `expansion` (`expansion_id`, `expansion_name`, `expansion_release_date`, `series_id`) VALUES
(1, 'Scarlet and Violet', '2023-03-31', 1),
(2, 'Temporal Forces', '2024-03-22', 1),
(3, 'Crown Zenith', '2023-01-20', 2),
(4, 'Cosmic Eclipse', '2019-11-01', 3),
(5, 'Unified Minds', '2019-08-02', 3);

-- --------------------------------------------------------

--
-- Table structure for table `rarity`
--

CREATE TABLE `rarity` (
  `rarity_id` int(11) NOT NULL,
  `rarity_name` varchar(255) NOT NULL,
  `rarity_symbol_url` varchar(2048) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `rarity`
--

INSERT INTO `rarity` (`rarity_id`, `rarity_name`, `rarity_symbol_url`) VALUES
(1, 'Common', 'https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/_tiles/sv/updates/inline/symbols/common.png'),
(2, 'Uncommon', 'https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/_tiles/sv/updates/inline/symbols/uncommon.png'),
(3, 'Rare', 'https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/_tiles/sv/updates/inline/symbols/rare.png');

-- --------------------------------------------------------

--
-- Table structure for table `series`
--

CREATE TABLE `series` (
  `series_id` int(11) NOT NULL,
  `series_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `series`
--

INSERT INTO `series` (`series_id`, `series_name`) VALUES
(1, 'Scarlet and Violet'),
(2, 'Sword and Shield'),
(3, 'Sun and Moon');

-- --------------------------------------------------------

--
-- Table structure for table `stage`
--

CREATE TABLE `stage` (
  `stage_id` int(11) NOT NULL,
  `stage_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `stage`
--

INSERT INTO `stage` (`stage_id`, `stage_name`) VALUES
(1, 'Basic'),
(2, 'Stage 1'),
(3, 'Stage 2');

-- --------------------------------------------------------

--
-- Table structure for table `type`
--

CREATE TABLE `type` (
  `type_id` int(11) NOT NULL,
  `type_name` varchar(255) NOT NULL,
  `type_symbol_url` varchar(2048) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `type`
--

INSERT INTO `type` (`type_id`, `type_name`, `type_symbol_url`) VALUES
(1, 'Colorless', 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/77bf3ba9-0aac-4452-be82-de536b5aab32/dezrwzj-a0900a9f-ecf0-4ff5-8626-83335695a144.png/v1/fill/w_893,h_895/colorless_energy_card_vector_symbol_by_biochao_dezrwzj-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI4MiIsInBhdGgiOiJcL2ZcLzc3YmYzYmE5LTBhYWMtNDQ1Mi1iZTgyLWRlNTM2YjVhYWIzMlwvZGV6cnd6ai1hMDkwMGE5Zi1lY2YwLTRmZjUtODYyNi04MzMzNTY5NWExNDQucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.9S9g3jnHB8TZRxq2wEGWby-taGyQgANagbZQz7URvh0'),
(2, 'Fairy', 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/77bf3ba9-0aac-4452-be82-de536b5aab32/dezrx1n-b886ead9-e7f6-4b2e-aad3-f2b03e6a23d0.png/v1/fill/w_894,h_894/fairy_energy_card_vector_symbol_by_biochao_dezrx1n-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI4MSIsInBhdGgiOiJcL2ZcLzc3YmYzYmE5LTBhYWMtNDQ1Mi1iZTgyLWRlNTM2YjVhYWIzMlwvZGV6cngxbi1iODg2ZWFkOS1lN2Y2LTRiMmUtYWFkMy1mMmIwM2U2YTIzZDAucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.lXqPk9iMKlBDP05D_0Anr4zKaR_XKOYoCWtXo5RvCBs'),
(3, 'Fire', 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/77bf3ba9-0aac-4452-be82-de536b5aab32/dezrx2m-6a187f20-c54f-443c-abb5-6304a14d1d39.png/v1/fill/w_895,h_893/fire_energy_card_vector_symbol_by_biochao_dezrx2m-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI3OCIsInBhdGgiOiJcL2ZcLzc3YmYzYmE5LTBhYWMtNDQ1Mi1iZTgyLWRlNTM2YjVhYWIzMlwvZGV6cngybS02YTE4N2YyMC1jNTRmLTQ0M2MtYWJiNS02MzA0YTE0ZDFkMzkucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.MrtaX3vm446Kd5jU02FfLdjMSyXljqW0ahnU8jEo0aE'),
(4, 'Electric', 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/77bf3ba9-0aac-4452-be82-de536b5aab32/dezrx16-513fe1dd-38ed-427b-bd33-f06c814bf32f.png/v1/fill/w_895,h_893/electric_energy_card_vector_symbol_by_biochao_dezrx16-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI3OCIsInBhdGgiOiJcL2ZcLzc3YmYzYmE5LTBhYWMtNDQ1Mi1iZTgyLWRlNTM2YjVhYWIzMlwvZGV6cngxNi01MTNmZTFkZC0zOGVkLTQyN2ItYmQzMy1mMDZjODE0YmYzMmYucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.U_F136VX-qaPr4LEg6He5GnACg1E5NsYhX9uRrmS_Ro'),
(5, 'Psychic', 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/77bf3ba9-0aac-4452-be82-de536b5aab32/dezrx4c-6cff5589-ce3b-4135-8ace-ee3bec01aa7e.png/v1/fill/w_895,h_893/psychic_energy_card_vector_symbol_by_biochao_dezrx4c-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI3OCIsInBhdGgiOiJcL2ZcLzc3YmYzYmE5LTBhYWMtNDQ1Mi1iZTgyLWRlNTM2YjVhYWIzMlwvZGV6cng0Yy02Y2ZmNTU4OS1jZTNiLTQxMzUtOGFjZS1lZTNiZWMwMWFhN2UucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.ZHn6anZ59G_2EsYUB07VZjquVekNJ0v7vm2tZG3XTWg'),
(6, 'Grass', 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/77bf3ba9-0aac-4452-be82-de536b5aab32/dezrx3b-faf247b4-bbcf-4a1d-bba4-47236408df42.png/v1/fill/w_895,h_893/grass_energy_card_vector_symbol_by_biochao_dezrx3b-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI3OCIsInBhdGgiOiJcL2ZcLzc3YmYzYmE5LTBhYWMtNDQ1Mi1iZTgyLWRlNTM2YjVhYWIzMlwvZGV6cngzYi1mYWYyNDdiNC1iYmNmLTRhMWQtYmJhNC00NzIzNjQwOGRmNDIucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.oOHbZYJsNszy_P66CbLaiuRVY8kFzjJvvxQ0tZkF3BM'),
(7, 'Fighting', 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/77bf3ba9-0aac-4452-be82-de536b5aab32/dezrx1z-f8ecfab3-6ba7-47a2-90b3-2e95bdcf0bfe.png/v1/fill/w_895,h_893/fighting_energy_card_vector_symbol_by_biochao_dezrx1z-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI3OCIsInBhdGgiOiJcL2ZcLzc3YmYzYmE5LTBhYWMtNDQ1Mi1iZTgyLWRlNTM2YjVhYWIzMlwvZGV6cngxei1mOGVjZmFiMy02YmE3LTQ3YTItOTBiMy0yZTk1YmRjZjBiZmUucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.EKHo_BKE0vX8i2JaYR2V1lStO5PRfMRR4y3WRrFsxVk'),
(8, 'Metal', 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/77bf3ba9-0aac-4452-be82-de536b5aab32/dezrx4z-608133ef-0158-48f9-8786-b8a39fd7e97f.png/v1/fill/w_895,h_893/steel_energy_card_vector_symbol_by_biochao_dezrx4z-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI3NyIsInBhdGgiOiJcL2ZcLzc3YmYzYmE5LTBhYWMtNDQ1Mi1iZTgyLWRlNTM2YjVhYWIzMlwvZGV6cng0ei02MDgxMzNlZi0wMTU4LTQ4ZjktODc4Ni1iOGEzOWZkN2U5N2YucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.HnQnbDYdY8dawx4dRmwVyYcjTXes-fA7zKEwHyo0wyo'),
(9, 'Dark', 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/77bf3ba9-0aac-4452-be82-de536b5aab32/dezrx06-5b31bdc5-e822-4f80-8d88-af30c132d4fb.png/v1/fill/w_894,h_894/dark_energy_card_vector_symbol_by_biochao_dezrx06-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI3OSIsInBhdGgiOiJcL2ZcLzc3YmYzYmE5LTBhYWMtNDQ1Mi1iZTgyLWRlNTM2YjVhYWIzMlwvZGV6cngwNi01YjMxYmRjNS1lODIyLTRmODAtOGQ4OC1hZjMwYzEzMmQ0ZmIucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.FG7xj8hrU1BZ0GrNftMJa0TJy0Qs9xteH1GT-lQ36Sc'),
(10, 'Dragon', 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/77bf3ba9-0aac-4452-be82-de536b5aab32/dezrx0m-156163e8-ce81-471d-b174-a1bf9c1b9923.png/v1/fill/w_895,h_893/dragon_energy_card_vector_symbol_by_biochao_dezrx0m-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI3OCIsInBhdGgiOiJcL2ZcLzc3YmYzYmE5LTBhYWMtNDQ1Mi1iZTgyLWRlNTM2YjVhYWIzMlwvZGV6cngwbS0xNTYxNjNlOC1jZTgxLTQ3MWQtYjE3NC1hMWJmOWMxYjk5MjMucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.jPsLEUZe3sHZn4Z8UCRfVvt_YGc1CCHM3CaLdeIzPn0'),
(11, 'Water', 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/77bf3ba9-0aac-4452-be82-de536b5aab32/dezrx5f-e4595600-3e33-4241-9b2b-74aaa2eef412.png/v1/fill/w_895,h_893/water_energy_card_vector_symbol_by_biochao_dezrx5f-pre.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI3OCIsInBhdGgiOiJcL2ZcLzc3YmYzYmE5LTBhYWMtNDQ1Mi1iZTgyLWRlNTM2YjVhYWIzMlwvZGV6cng1Zi1lNDU5NTYwMC0zZTMzLTQyNDEtOWIyYi03NGFhYTJlZWY0MTIucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.7SbyLKwiuihvL8f8Xs5D301oKDuaS2kGu_fqIZAtWf4');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varbinary(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'member'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `first_name`, `last_name`, `email`, `password`, `role`) VALUES
(45, 'Kerry Jinyi', 'Wu', 'kjw@email.com', 0x243262243130244f5a4467305a4a434d596b685763682e36585538362e75587069527977526b5a46535562456f4a7063744979546f49704653434a47, 'admin'),
(61, 'Pokemon', 'Lover', 'pokemonlover@email.com', 0x243262243130247759704f4f7a4f6644757474734f53627346434443754e7034654d6f734a736677566f727165503165543457303254584458345032, 'member');

-- --------------------------------------------------------

--
-- Table structure for table `user_like_collection`
--

CREATE TABLE `user_like_collection` (
  `like_id` int(11) NOT NULL,
  `collection_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `weakness`
--

CREATE TABLE `weakness` (
  `weakness_id` int(11) NOT NULL,
  `weakness_value` int(11) NOT NULL,
  `type_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `weakness`
--

INSERT INTO `weakness` (`weakness_id`, `weakness_value`, `type_id`) VALUES
(1, 2, 1),
(2, 2, 2),
(3, 2, 3),
(4, 2, 4),
(5, 2, 5),
(6, 2, 6),
(7, 2, 7),
(8, 2, 8),
(9, 2, 9),
(10, 2, 10),
(11, 2, 11);

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `wishlist_id` int(11) NOT NULL,
  `card_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `wishlist`
--

INSERT INTO `wishlist` (`wishlist_id`, `card_id`, `user_id`) VALUES
(23, 20, 45),
(24, 21, 45),
(25, 16, 45),
(26, 7, 45),
(27, 19, 45),
(28, 3, 45),
(29, 32, 45);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_request`
--
ALTER TABLE `admin_request`
  ADD PRIMARY KEY (`admin_request_id`),
  ADD KEY `FK_user_user_id_3` (`user_id`);

--
-- Indexes for table `attack`
--
ALTER TABLE `attack`
  ADD PRIMARY KEY (`attack_id`);

--
-- Indexes for table `attack_type`
--
ALTER TABLE `attack_type`
  ADD PRIMARY KEY (`attack_type_id`),
  ADD KEY `FK_attack_attack_id` (`attack_id`),
  ADD KEY `FK_type_type_id` (`type_id`);

--
-- Indexes for table `card`
--
ALTER TABLE `card`
  ADD PRIMARY KEY (`card_id`),
  ADD KEY `FK_rarity_rarity_id` (`rarity_id`),
  ADD KEY `FK_type_type_id_2` (`type_id`),
  ADD KEY `FK_stage_stage_id` (`stage_id`),
  ADD KEY `FK_weakness_weakness_id` (`weakness_id`),
  ADD KEY `FK_expansion_expansion_id` (`expansion_id`);

--
-- Indexes for table `card_attack`
--
ALTER TABLE `card_attack`
  ADD PRIMARY KEY (`card_attack_id`),
  ADD KEY `FK_card_card_id` (`card_id`),
  ADD KEY `FK_attack_attack_id_2` (`attack_id`);

--
-- Indexes for table `card_collection`
--
ALTER TABLE `card_collection`
  ADD PRIMARY KEY (`card_collection_id`),
  ADD KEY `FK_card_card_id_2` (`card_id`),
  ADD KEY `FK_collection_collection_id` (`collection_id`);

--
-- Indexes for table `collection`
--
ALTER TABLE `collection`
  ADD PRIMARY KEY (`collection_id`),
  ADD KEY `FK_member_member_id` (`user_id`),
  ADD KEY `FK_type_type_id_3` (`collection_logo_type_id`);

--
-- Indexes for table `comment`
--
ALTER TABLE `comment`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `FK_user_user_id_2` (`user_id`),
  ADD KEY `FK_collection_collection_id_3` (`collection_id`);

--
-- Indexes for table `expansion`
--
ALTER TABLE `expansion`
  ADD PRIMARY KEY (`expansion_id`),
  ADD KEY `FK_series_series_id_2` (`series_id`);

--
-- Indexes for table `rarity`
--
ALTER TABLE `rarity`
  ADD PRIMARY KEY (`rarity_id`);

--
-- Indexes for table `series`
--
ALTER TABLE `series`
  ADD PRIMARY KEY (`series_id`);

--
-- Indexes for table `stage`
--
ALTER TABLE `stage`
  ADD PRIMARY KEY (`stage_id`);

--
-- Indexes for table `type`
--
ALTER TABLE `type`
  ADD PRIMARY KEY (`type_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_like_collection`
--
ALTER TABLE `user_like_collection`
  ADD PRIMARY KEY (`like_id`),
  ADD UNIQUE KEY `collection_id` (`collection_id`,`user_id`),
  ADD KEY `FK_user_user_id` (`user_id`);

--
-- Indexes for table `weakness`
--
ALTER TABLE `weakness`
  ADD PRIMARY KEY (`weakness_id`),
  ADD KEY `FK_type_type_id_4` (`type_id`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`wishlist_id`),
  ADD KEY `FK_card_card_id_3` (`card_id`),
  ADD KEY `FK_member_member_id_2` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_request`
--
ALTER TABLE `admin_request`
  MODIFY `admin_request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `attack`
--
ALTER TABLE `attack`
  MODIFY `attack_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=133;

--
-- AUTO_INCREMENT for table `attack_type`
--
ALTER TABLE `attack_type`
  MODIFY `attack_type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `card`
--
ALTER TABLE `card`
  MODIFY `card_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `card_attack`
--
ALTER TABLE `card_attack`
  MODIFY `card_attack_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=221;

--
-- AUTO_INCREMENT for table `card_collection`
--
ALTER TABLE `card_collection`
  MODIFY `card_collection_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `collection`
--
ALTER TABLE `collection`
  MODIFY `collection_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `comment`
--
ALTER TABLE `comment`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `expansion`
--
ALTER TABLE `expansion`
  MODIFY `expansion_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `rarity`
--
ALTER TABLE `rarity`
  MODIFY `rarity_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `series`
--
ALTER TABLE `series`
  MODIFY `series_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `stage`
--
ALTER TABLE `stage`
  MODIFY `stage_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `type`
--
ALTER TABLE `type`
  MODIFY `type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `user_like_collection`
--
ALTER TABLE `user_like_collection`
  MODIFY `like_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `weakness`
--
ALTER TABLE `weakness`
  MODIFY `weakness_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `wishlist_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_request`
--
ALTER TABLE `admin_request`
  ADD CONSTRAINT `FK_user_user_id_3` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `attack_type`
--
ALTER TABLE `attack_type`
  ADD CONSTRAINT `FK_attack_attack_id` FOREIGN KEY (`attack_id`) REFERENCES `attack` (`attack_id`),
  ADD CONSTRAINT `FK_type_type_id` FOREIGN KEY (`type_id`) REFERENCES `type` (`type_id`);

--
-- Constraints for table `card`
--
ALTER TABLE `card`
  ADD CONSTRAINT `FK_expansion_expansion_id` FOREIGN KEY (`expansion_id`) REFERENCES `expansion` (`expansion_id`),
  ADD CONSTRAINT `FK_rarity_rarity_id` FOREIGN KEY (`rarity_id`) REFERENCES `rarity` (`rarity_id`),
  ADD CONSTRAINT `FK_stage_stage_id` FOREIGN KEY (`stage_id`) REFERENCES `stage` (`stage_id`),
  ADD CONSTRAINT `FK_type_type_id_2` FOREIGN KEY (`type_id`) REFERENCES `type` (`type_id`),
  ADD CONSTRAINT `FK_weakness_weakness_id` FOREIGN KEY (`weakness_id`) REFERENCES `weakness` (`weakness_id`);

--
-- Constraints for table `card_attack`
--
ALTER TABLE `card_attack`
  ADD CONSTRAINT `FK_attack_attack_id_2` FOREIGN KEY (`attack_id`) REFERENCES `attack` (`attack_id`),
  ADD CONSTRAINT `FK_card_card_id` FOREIGN KEY (`card_id`) REFERENCES `card` (`card_id`);

--
-- Constraints for table `card_collection`
--
ALTER TABLE `card_collection`
  ADD CONSTRAINT `FK_card_card_id_2` FOREIGN KEY (`card_id`) REFERENCES `card` (`card_id`),
  ADD CONSTRAINT `FK_collection_collection_id` FOREIGN KEY (`collection_id`) REFERENCES `collection` (`collection_id`);

--
-- Constraints for table `collection`
--
ALTER TABLE `collection`
  ADD CONSTRAINT `FK_member_member_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `FK_type_type_id_3` FOREIGN KEY (`collection_logo_type_id`) REFERENCES `type` (`type_id`);

--
-- Constraints for table `comment`
--
ALTER TABLE `comment`
  ADD CONSTRAINT `FK_collection_collection_id_3` FOREIGN KEY (`collection_id`) REFERENCES `collection` (`collection_id`),
  ADD CONSTRAINT `FK_user_user_id_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `expansion`
--
ALTER TABLE `expansion`
  ADD CONSTRAINT `FK_series_series_id_2` FOREIGN KEY (`series_id`) REFERENCES `series` (`series_id`);

--
-- Constraints for table `user_like_collection`
--
ALTER TABLE `user_like_collection`
  ADD CONSTRAINT `FK_collection_collection_id_2` FOREIGN KEY (`collection_id`) REFERENCES `collection` (`collection_id`),
  ADD CONSTRAINT `FK_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `weakness`
--
ALTER TABLE `weakness`
  ADD CONSTRAINT `FK_type_type_id_4` FOREIGN KEY (`type_id`) REFERENCES `type` (`type_id`);

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `FK_card_card_id_3` FOREIGN KEY (`card_id`) REFERENCES `card` (`card_id`),
  ADD CONSTRAINT `FK_member_member_id_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
