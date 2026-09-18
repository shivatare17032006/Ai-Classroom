package com.aiclassroom.repository;

import com.aiclassroom.model.InstitutionLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstitutionLicenseRepository extends JpaRepository<InstitutionLicense, String> {
    Optional<InstitutionLicense> findByDomainExtension(String domainExtension);
}
