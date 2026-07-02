-- =====================================================================
-- PittaPong / Loja - Script do banco de dados relacional (MySQL 8.x)
-- Base: pittapong
--
-- Adaptado do dump fornecido pelo professor (Dump20260622.sql, base `loja`)
-- para a base `pittapong` usada pela API. Inclui os dados reais e a tabela
-- `usuarios` conforme o dump (colunas: id_usuario, nome, nick, senha).
--
-- Observacao: o usuario `candido` do dump tem senha em MD5 e NAO e usado
-- para login (a API valida com bcrypt). Rode `npm run seed` para criar um
-- usuario administrador com senha bcrypt.
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `pittapong`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `pittapong`;

--
-- Table structure for table `categorias`
--
DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias` (
  `id_categoria` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) NOT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `idcategoria_UNIQUE` (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;

INSERT INTO `categorias` VALUES (1,'Note Books'),(2,'Impressoras'),(3,'Telas'),(4,'Suprimentos'),(5,'Acessório'),(6,'Softwares');

--
-- Table structure for table `clientes`
--
DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `id_cliente` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) NOT NULL,
  `telefone` varchar(15) NOT NULL,
  `status` enum('bom','medio','ruim') DEFAULT 'medio',
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `id_cliente_UNIQUE` (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;

INSERT INTO `clientes` VALUES (1,'Avaro Alvarenga','51987455432','medio'),(2,'Euclides da Cunha','51998776123','medio'),(3,'Gaciliano Ramos','51971488123','medio'),(4,'Ariclenes de Almeida','51992575315','medio');

--
-- Table structure for table `endereco`
--
DROP TABLE IF EXISTS `endereco`;
CREATE TABLE `endereco` (
  `id_endereco` int unsigned NOT NULL AUTO_INCREMENT,
  `logradouro` varchar(45) NOT NULL,
  `numero` varchar(10) NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `bairro` varchar(45) NOT NULL,
  `cep` varchar(12) NOT NULL,
  `cidade` varchar(45) NOT NULL,
  `clientes_id_cliente` int unsigned NOT NULL,
  PRIMARY KEY (`id_endereco`),
  UNIQUE KEY `id_endereco_UNIQUE` (`id_endereco`),
  KEY `fk_endereco_clientes_idx` (`clientes_id_cliente`),
  CONSTRAINT `fk_endereco_clientes` FOREIGN KEY (`clientes_id_cliente`) REFERENCES `clientes` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Table structure for table `pedidos`
--
DROP TABLE IF EXISTS `pedidos`;
CREATE TABLE `pedidos` (
  `id_pedido` int unsigned NOT NULL AUTO_INCREMENT,
  `data` date NOT NULL,
  `clientes_id_cliente` int unsigned NOT NULL,
  PRIMARY KEY (`id_pedido`),
  UNIQUE KEY `id_pedido_UNIQUE` (`id_pedido`),
  KEY `fk_pedidos_clientes1_idx` (`clientes_id_cliente`),
  CONSTRAINT `fk_pedidos_clientes1` FOREIGN KEY (`clientes_id_cliente`) REFERENCES `clientes` (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

INSERT INTO `pedidos` VALUES (1,'2026-04-16',1),(2,'2026-04-16',3),(3,'2026-04-16',2);

--
-- Table structure for table `produtos`
--
DROP TABLE IF EXISTS `produtos`;
CREATE TABLE `produtos` (
  `id_produto` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) NOT NULL,
  `valor` double NOT NULL,
  `estoque` int NOT NULL DEFAULT '1',
  `categorias_id_categoria` int unsigned NOT NULL,
  PRIMARY KEY (`id_produto`),
  UNIQUE KEY `id_produto_UNIQUE` (`id_produto`),
  KEY `fk_produtos_categorias1_idx` (`categorias_id_categoria`),
  KEY `index_estoque` (`estoque`),
  CONSTRAINT `fk_produtos_categorias1` FOREIGN KEY (`categorias_id_categoria`) REFERENCES `categorias` (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb3;

INSERT INTO `produtos` VALUES (1,'Impressora Multifuncional Laser MF262DW, Monocromática, Impressão Duplex, Wi-fi',1259,5,2),(2,'Impressora Multifuncional HP Smart Tank 581 Tanque de Tinta (4A8D5A), Colorida',862,9,2),(3,'Impressora Multifuncional Laser Color, MF656CDW, Impressão Duplex, Wi-fi, Conexão Ethernet',3599,3,2),(4,'Impressora matricial LX-350, Conexão Paralela, Conexão USB, 110v - Epson CX',1997,4,2),(5,'Impressora Multifuncional tanque de tinta DCP-T430W, Colorida, Wi-fi, USB, Bivolt, Brother',1034,4,2),(6,'Monitor Gamer LG 24, Tela LED IPS Full HD, Taxa de atualização de 100Hz',736,15,3),(7,'Monitor LED tela de 24, Full HD, HDMI / VGA , 100Hz, 5ms, Branco, MR-240WH, C3Tech - CX 1',543,8,3),(8,'Monitor LED P22a G5, Tela IPS de 21,5, Full HD, HDMI / VGA, 75Hz, 5ms, Preto, 8D5J1AA, HP',1067,7,3),(9,'Monitor LED Portátil, Tela de 15,6, FHD, 6ms, 60hz, PM161Q, Acer',688,3,3),(10,'Monitor Gamer 21,5, Tela LED Full HD, Taxa de Atualização de 75Hz, Tempo de Resposta 4m',619,4,3),(11,'Estojo para acessórios Logic Invigo, Eco Plus, 3205109, Case Logic',229,30,5),(12,'Notebook ASUS Vivobook Go 15, Intel Celeron N4500 Dual Core, 4GB de Memória',2034,3,1),(13,'Notebook HP 256R-G9, Processador Intel Core i5, Windows 11 Home, 16GB de Memória, 256GB',4578,2,1),(14,'Notebook Aspire Go 15, AG15-71P-5939, Processador Intel Core I5, Windows 11 Home, 8GB',4323,3,1),(17,'Microsoft 365 Family com Copilot: 1 licença para até 6 usuários - Word, Excel, PowerPoint,...',499,12,6),(18,'Microsoft 365 Family com Copilot: 1 licença para até 6 usuários Assinatura 12 meses e Kasp...',439,10,6),(19,'Windows 11 Home, 1 dispositivo Download, KW9-00664, Microsoft',999,15,6),(20,'Cartucho de Tinta HP 667 Preto Original (3YM79AB) + Cartucho de Tinta HP 667 Colorido Orig...',173,30,4),(21,'Cartucho de Tinta HP 667XL Preto Original (3YM81AB) + Cartucho de Tinta HP 667XL Colorido',417,20,4),(22,'Kit com 4 Garrafa de Tintas de Tinta Epson, Preto, Ciano, Magenta, Amarelo, T544520-4P - E...',225,13,4),(23,'Toner HP 105A Preto Laser Original, W1105AB, HP CX 1 UN CX 1 UN',439,17,4),(24,'Kit com 2 Garrafa de Tintas de Tinta Epson, Preto, T544120-2P - Epson - CX 1 UN',118,12,4);

--
-- Table structure for table `produtos_pedidos`
--
DROP TABLE IF EXISTS `produtos_pedidos`;
CREATE TABLE `produtos_pedidos` (
  `produtos_id_produto` int unsigned NOT NULL,
  `pedidos_id_pedido` int unsigned NOT NULL,
  `quantidade` double NOT NULL,
  `valor` double NOT NULL,
  PRIMARY KEY (`produtos_id_produto`,`pedidos_id_pedido`),
  KEY `fk_produtos_has_pedidos_pedidos1_idx` (`pedidos_id_pedido`),
  KEY `fk_produtos_has_pedidos_produtos1_idx` (`produtos_id_produto`),
  CONSTRAINT `fk_produtos_has_pedidos_pedidos1` FOREIGN KEY (`pedidos_id_pedido`) REFERENCES `pedidos` (`id_pedido`),
  CONSTRAINT `fk_produtos_has_pedidos_produtos1` FOREIGN KEY (`produtos_id_produto`) REFERENCES `produtos` (`id_produto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

INSERT INTO `produtos_pedidos` VALUES (1,1,1,1259),(2,2,1,862),(6,1,1,736),(7,2,1,541),(9,1,1,688),(13,2,1,4578);

--
-- Table structure for table `usuarios` (conforme o dump do professor)
--
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id_usuario` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) NOT NULL,
  `nick` varchar(15) NOT NULL,
  `senha` varchar(90) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `id_usuario_UNIQUE` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;

INSERT INTO `usuarios` VALUES (1,'Cândido Farias','candido','5f3d38ef49c971f33ce525bd678102c0');

SET FOREIGN_KEY_CHECKS = 1;
