// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Document Certification
/// @notice Permite que qualquer usuário registre um hash de documento on-chain, armazenando timestamp e emissor.
contract DocumentCertification {
    // Mapeia cada hash de documento ao instante da certificação e ao certificador
    struct Certification {
        uint256 timestamp;
        address certifier;
    }

    mapping(bytes32 => Certification) private certifications;

    /// @notice Emitido sempre que um documento é certificado
    event DocumentCertified(
        bytes32 indexed documentHash,
        address indexed certifier,
        uint256 timestamp
    );

    /// @notice Registra o hash de um documento, se ainda não estiver certificado
    /// @param documentHash Hash SHA-256 ou similar do documento
    function certifyDocument(bytes32 documentHash) external {
        // Garante que o documento ainda não foi certificado
        require(certifications[documentHash].timestamp == 0, "Ja certificado");

        // Grava a certificação
        certifications[documentHash] = Certification({
            timestamp: block.timestamp,
            certifier: msg.sender
        });

        emit DocumentCertified(documentHash, msg.sender, block.timestamp);
    }

    /// @notice Consulta dados de certificação de um hash
    /// @param documentHash Hash do documento
    /// @return timestamp Em que foi certificado
    /// @return certifier Endereço que certificou
    function getCertification(bytes32 documentHash)
        external
        view
        returns (uint256 timestamp, address certifier)
    {
        Certification memory cert = certifications[documentHash];
        require(cert.timestamp != 0, "Nao certificado");
        return (cert.timestamp, cert.certifier);
    }
}
