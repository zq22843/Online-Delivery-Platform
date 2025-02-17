package com.sep.onlinedeliverysystem.services.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.stereotype.Service;

import com.sep.onlinedeliverysystem.domain.entities.Driver;
import com.sep.onlinedeliverysystem.repositories.DriverRepository;
import com.sep.onlinedeliverysystem.services.DriverService;

@Service
public class DriverServiceImpl implements DriverService {

    private DriverRepository driverRepository;

    public DriverServiceImpl(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    @Override
    public Driver save(Driver driverEntity) {
        return driverRepository.save(driverEntity);
    }

    @Override
    public List<Driver> findAll() {
       return StreamSupport.stream(driverRepository.findAll().spliterator(), false).collect(Collectors.toList());
    }

    @Override
    public Optional<Driver> findOne(String email) {
        return driverRepository.findById(email);
    }

    @Override
    public boolean Exists(String email) {
        return driverRepository.existsById(email);
    }

    @Override
    public Driver partialUpdate(String email, Driver driverEntity) {
        driverEntity.setEmail(email);

        return driverRepository.findById(email).map(existingDriver ->{
            Optional.ofNullable(driverEntity.getRating()).ifPresent(existingDriver::setRating);
            Optional.ofNullable(driverEntity.getPassword()).ifPresent(existingDriver::setPassword);
            Optional.ofNullable(driverEntity.getName()).ifPresent(existingDriver::setName);
            return driverRepository.save(existingDriver);
        }).orElseThrow(() -> new RuntimeException("Driver doesn't exist"));
    }

    @Override
    public void delete(String email) {
        driverRepository.deleteById(email);
    }

    @Override
    /*public boolean updateProfile(String email, String currentPassword, String newName, String newPassword) {
        return false;
    }*/

    public boolean updateProfile(String email, String currentPassword, String newName, String newPassword) {
        Optional<Driver> driverOptional = driverRepository.findById(email);
        if (driverOptional.isPresent()) {
            Driver driver = driverOptional.get();
            // Check if the current password matches
            if (currentPassword.equals(driver.getPassword())) {
                // Update the first name and last name fields
                driver.setName(newName);
                // Update the password if a new password is provided
                if (newPassword != null && !newPassword.isEmpty()) {
                    driver.setPassword(newPassword);
                }
                driverRepository.save(driver);
                return true;
            }
        }
        return false;
    }
}
