package thl.campusprint.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import thl.campusprint.models.Device;

@Repository
public interface DeviceRepository extends JpaRepository<Device, UUID> {
    // this is all thats needed
}