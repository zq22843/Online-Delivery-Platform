package com.sep.onlinedeliverysystem.services.impl;

import com.sep.onlinedeliverysystem.domain.entities.User;
import com.sep.onlinedeliverysystem.domain.entities.UserDetailsEntity;
import com.sep.onlinedeliverysystem.repositories.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service("userDetailsService")
public class MyUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public MyUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<User> userOptional = userRepository.findById(email);

        User user = userOptional
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        UserDetailsEntity userDetails = user.toUserDetails();


        return org.springframework.security.core.userdetails.User
                .withUsername(userDetails.getUsername())
                .password(userDetails.getPassword())
                .authorities("USER") // Add roles or authorities as needed
                .accountExpired(!userDetails.isAccountNonExpired())
                .accountLocked(!userDetails.isAccountNonLocked())
                .credentialsExpired(!userDetails.isCredentialsNonExpired())
                .disabled(!userDetails.isEnabled())
                .build();
    }
}