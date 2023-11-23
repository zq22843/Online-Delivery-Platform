package com.sep.onlinedeliverysystem.controllers;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.sep.onlinedeliverysystem.TestUtil;
import com.sep.onlinedeliverysystem.domain.dto.UserAddressDTO;
import com.sep.onlinedeliverysystem.domain.entities.User;
import com.sep.onlinedeliverysystem.domain.entities.UserAddress;
import com.sep.onlinedeliverysystem.services.UserAddressService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

@SpringBootTest
@ExtendWith(SpringExtension.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@AutoConfigureMockMvc
public class UserAddressControllerIntegrationTests {

    private UserAddressService userAddressService;
    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Autowired
    public UserAddressControllerIntegrationTests(MockMvc mockMvc, UserAddressService userAddressService) {
        this.mockMvc = mockMvc;
        this.userAddressService = userAddressService;
        this.objectMapper = new ObjectMapper();
    }

    @Test
    public void testThatCreateAddressSuccessfullyReturnsHttp201Created() throws Exception {
        UserAddress testAddress1 = TestUtil.userAddressBuild1(null);
        String addressJson = objectMapper.writeValueAsString(testAddress1);
        mockMvc.perform(
                MockMvcRequestBuilders.post("/addresses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addressJson)
        ).andExpect(
                MockMvcResultMatchers.status().isCreated()
        );
    }

    @Test
    public void testThatCreateAddressEntitySuccessfullyReturnsSavedAddress() throws Exception {
        UserAddress testAddress1 = TestUtil.userAddressBuild1(null);
        String addressJson = objectMapper.writeValueAsString(testAddress1);
        mockMvc.perform(
                MockMvcRequestBuilders.post("/addresses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addressJson)
        ).andExpect(
                MockMvcResultMatchers.jsonPath("$.street").value("123 Kiggell Road")
        );
    }

    @Test
    public void testThatCreateAddressDTOSuccessfullyReturnsSavedAddress() throws Exception {
        UserAddressDTO testAddress1 = TestUtil.userAddressDTOCreate1(null);
        String addressJson = objectMapper.writeValueAsString(testAddress1);
        mockMvc.perform(
                MockMvcRequestBuilders.post("/addresses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addressJson)
        ).andExpect(
                MockMvcResultMatchers.jsonPath("$.street").value("123 Kiggell Road")
        );
    }

    @Test
    public void testThatListAddressSuccessfullyReturnsHttp200Ok() throws Exception {
        mockMvc.perform(
                MockMvcRequestBuilders.get("/addresses")
                        .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(
                MockMvcResultMatchers.status().isOk()
        );
    }

    @Test
    public void testThatListAddressSuccessfullyReturnsListOfAddresses() throws Exception {
        User testUser = TestUtil.userBuild1();

        UserAddress testAddress1 = TestUtil.userAddressBuild1(testUser);
        userAddressService.save(testAddress1);
        mockMvc.perform(
                MockMvcRequestBuilders.get("/addresses")
                        .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(
                MockMvcResultMatchers.jsonPath("$[0].street").value("123 Kiggell Road")
        );
    }

    @Test
    public void testThatGetAddressSuccessfullyReturnsHttpStatus200OkWhenAddressExists() throws Exception {
        UserAddress testAddress1 = TestUtil.userAddressBuild1(null);
        userAddressService.save(testAddress1);
        mockMvc.perform(
                MockMvcRequestBuilders.get("/addresses/" + testAddress1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    public void testThatGetAddressSuccessfullyReturnsHttpStatus404NotFoundWhenAddressDoesNotExist() throws Exception {
        mockMvc.perform(
                MockMvcRequestBuilders.get("/addresses/123")
                        .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(MockMvcResultMatchers.status().isNotFound());
    }

    @Test
    public void testThatGetAddressSuccessfullyReturnsAddressWhenAddressExists() throws Exception {
        UserAddress testAddress1 = TestUtil.userAddressBuild1(null);
        userAddressService.save(testAddress1);
        mockMvc.perform(
                MockMvcRequestBuilders.get("/addresses/" + testAddress1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(
                MockMvcResultMatchers.jsonPath("$.street").value("123 Kiggell Road")
        );
    }

    @Test
    public void testThatFullUpdateAddressSuccessfullyReturnsHttpStatus404NotFoundWhenAddressDoesNotExist() throws Exception {
        UserAddressDTO testAddress1 = TestUtil.userAddressDTOCreate1(null);
        String addressDTOJson = objectMapper.writeValueAsString(testAddress1);
        mockMvc.perform(
                MockMvcRequestBuilders.put("/addresses/123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addressDTOJson)
        ).andExpect(MockMvcResultMatchers.status().isNotFound());
    }

    @Test
    public void testThatFullUpdateAddressSuccessfullyReturnsHttpStatus200OKWhenAddressExists() throws Exception {
        UserAddress testUserAddress1 = TestUtil.userAddressBuild1(null);
        UserAddress savedAddress = userAddressService.save(testUserAddress1);
        UserAddressDTO testUserAddressDTO1 = TestUtil.userAddressDTOCreate1(null);
        String addressDTOJson = objectMapper.writeValueAsString(testUserAddressDTO1);
        mockMvc.perform(
                MockMvcRequestBuilders.put("/addresses/" + savedAddress.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addressDTOJson)
        ).andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    public void testThatFullUpdateUpdatesExistingAddress() throws Exception {
        UserAddress testUserAddress1 = TestUtil.userAddressBuild1(null);
        UserAddress savedAddress = userAddressService.save(testUserAddress1);

        UserAddress addressDTO = TestUtil.userAddressBuild2(null);
        addressDTO.setId(savedAddress.getId());
        String addressUpdateDTOJson = objectMapper.writeValueAsString(addressDTO);
        mockMvc.perform(
                MockMvcRequestBuilders.put("/addresses/" + savedAddress.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addressUpdateDTOJson)
        ).andExpect(
                MockMvcResultMatchers.jsonPath("$.id").value(savedAddress.getId())
        ).andExpect(
                MockMvcResultMatchers.jsonPath("$.street").value(addressDTO.getStreet())
        ).andExpect(
                MockMvcResultMatchers.jsonPath("$.postCode").value(addressDTO.getPostCode())
        );
    }

    @Test
    public void testThatPartialUpdateAddressSuccessfullyReturnsHttpStatus200OKWhenAddressExists() throws Exception {
        UserAddress testUserAddress = TestUtil.userAddressBuild1(null);
        UserAddress savedAddress = userAddressService.save(testUserAddress);

        UserAddressDTO testUserAddressDTO = TestUtil.userAddressDTOCreate1(null);
        testUserAddressDTO.setId(savedAddress.getId());
        testUserAddressDTO.setStreet("UPDATED!!!");
        String addressDTOJson = objectMapper.writeValueAsString(testUserAddressDTO);
        mockMvc.perform(
                MockMvcRequestBuilders.patch("/addresses/" + savedAddress.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addressDTOJson)
        ).andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    public void testThatPartialUpdateAddressSuccessfullyReturnsUpdatedAddress() throws Exception {
        UserAddress testUserAddress = TestUtil.userAddressBuild1(null);
        UserAddress savedAddress = userAddressService.save(testUserAddress);

        UserAddressDTO testUserAddressDTO = TestUtil.userAddressDTOCreate1(null);
        testUserAddressDTO.setId(savedAddress.getId());
        testUserAddressDTO.setStreet("UPDATED!!!");
        String addressDTOJson = objectMapper.writeValueAsString(testUserAddressDTO);
        mockMvc.perform(
                MockMvcRequestBuilders.patch("/addresses/" + savedAddress.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addressDTOJson)
        ).andExpect(
                MockMvcResultMatchers.jsonPath("$.id").value(savedAddress.getId())
        ).andExpect(
                MockMvcResultMatchers.jsonPath("$.postCode").value(testUserAddressDTO.getPostCode())
        ).andExpect(
                MockMvcResultMatchers.jsonPath("$.street").value("UPDATED!!!")
        );
    }

    @Test
    public void testThatDeleteAddressReturnsHttpStatus204ForNonExistingAddress() throws Exception{
        mockMvc.perform(
                MockMvcRequestBuilders.delete("/addresses/1235832")
                        .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(MockMvcResultMatchers.status().isNoContent());
    }

    @Test
    public void testThatDeleteAddressReturnsHttpStatus204ForExistingAddress() throws Exception{
        UserAddress testUserAddress = TestUtil.userAddressBuild1(null);
        UserAddress savedAddress = userAddressService.save(testUserAddress);
        mockMvc.perform(
                MockMvcRequestBuilders.delete("/addresses/" + savedAddress.getId())
                        .contentType(MediaType.APPLICATION_JSON)
        ).andExpect(MockMvcResultMatchers.status().isNoContent());
    }


}
