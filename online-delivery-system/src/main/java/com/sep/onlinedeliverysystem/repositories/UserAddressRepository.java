package com.sep.onlinedeliverysystem.repositories;


import com.sep.onlinedeliverysystem.domain.entities.UserAddress;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAddressRepository extends CrudRepository<UserAddress, Long> {
    Optional<UserAddress> findByUserEmail(String email);
}
