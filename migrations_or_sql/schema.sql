CREATE DATABASE IF NOT EXISTS floricultura CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE floricultura;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senhaHash VARCHAR(255) NOT NULL,
  tipoUsuario ENUM('admin','cliente') DEFAULT 'cliente',
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) DEFAULT 0.00,
  categoria VARCHAR(100),
  quantidade_em_estoque INT DEFAULT 0,
  imagem_url VARCHAR(1024),
  usuarioId INT,
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS mensagens_contato (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  assunto VARCHAR(255),
  mensagem TEXT NOT NULL,
  dataEnvio DATETIME DEFAULT CURRENT_TIMESTAMP,
  usuarioId INT,
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE SET NULL
);
