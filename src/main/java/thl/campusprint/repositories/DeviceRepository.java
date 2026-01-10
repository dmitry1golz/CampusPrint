package thl.campusprint.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import thl.campusprint.models.Device;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Integer> {
  // this is all thats needed
}
