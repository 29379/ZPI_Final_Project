package pwr.zpibackend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import pwr.zpibackend.config.GoogleAuthService;
import pwr.zpibackend.dto.EmployeeDTO;
import pwr.zpibackend.dto.RoleDTO;
import pwr.zpibackend.exceptions.AlreadyExistsException;
import pwr.zpibackend.exceptions.CannotDeleteException;
import pwr.zpibackend.exceptions.NotFoundException;
import pwr.zpibackend.models.Employee;
import pwr.zpibackend.models.Role;
import pwr.zpibackend.services.EmployeeService;
import pwr.zpibackend.services.StudentService;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EmployeeController.class)
@AutoConfigureMockMvc(addFilters = false)
public class EmployeeControllerTests {

    private static final String BASE_URL = "/employee";

    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private GoogleAuthService googleAuthService;
    @MockBean
    private EmployeeService employeeService;
    @MockBean
    private StudentService studentService;
    @Autowired
    private MockMvc mockMvc;
    @InjectMocks
    private EmployeeController employeeController;

    private List<Employee> employees;
    private Employee employee;

    private EmployeeDTO employeeDTO;

    @BeforeEach
    public void setUp() {
        employee = new Employee();
        employee.setMail("123456@pwr.edu.pl");
        employee.setName("John");
        employee.setSurname("Doe");
        employee.setDepartment(null);
        employee.setTitle("mgr");

        Role role = new Role("admin");
        List<Role> roles = new ArrayList<>();
        roles.add(role);
        employee.setRoles(roles);

        Employee employee2 = new Employee();
        employee2.setMail("121212@pwr.edu.pl");
        employee2.setName("Jane");
        employee2.setSurname("Doe");
        employee2.setDepartment(null);
        employee2.setTitle("dr");
        employee2.setRoles(roles);

        employeeDTO = new EmployeeDTO();
        employeeDTO.setMail("111111@pwr.edu.pl");
        employeeDTO.setName("John");
        employeeDTO.setSurname("Doe");
        employeeDTO.setDepartmentCode(null);
        employeeDTO.setTitle("mgr");
        List<RoleDTO> roleDTOS = new ArrayList<>();
        roleDTOS.add(new RoleDTO("admin"));
        employeeDTO.setRoles(roleDTOS);

        employees = new ArrayList<>();
        employees.add(employee);
        employees.add(employee2);
    }

    @Test
    public void testGetAllEmployees() throws Exception {
        Mockito.when(employeeService.getAllEmployees()).thenReturn(employees);

        String returnedJson = objectMapper.writeValueAsString(employees);

        mockMvc.perform(get(BASE_URL).contentType("application/json"))
                .andExpect(status().isOk())
                .andExpect(content().json(returnedJson));

        verify(employeeService).getAllEmployees();
    }

    @Test
    public void testGetEmployeeById() throws Exception {
        String mail = "123456@pwr.edu.pl";
        Mockito.when(employeeService.getEmployee(mail)).thenReturn(employee);

        String returnedJson = objectMapper.writeValueAsString(employee);

        mockMvc.perform(get(BASE_URL + "/{id}", mail).contentType("application/json"))
                .andExpect(status().isOk())
                .andExpect(content().json(returnedJson));

        verify(employeeService).getEmployee(mail);
    }

    @Test
    public void testGetEmployeeByIdNotFound() throws Exception {
        String mail = "123456@pwr.edu.pl";
        Mockito.when(employeeService.getEmployee(mail)).thenThrow(new NoSuchElementException());

        mockMvc.perform(get(BASE_URL + "/{id}", mail).contentType("application/json"))
                .andExpect(status().isNotFound());

        verify(employeeService).getEmployee(mail);
    }

    @Test
    public void testGetEmployeesByPrefix() throws Exception {
        String prefix = "12";
        Mockito.when(employeeService.getEmployeesByPrefix(prefix)).thenReturn(employees);

        String returnedJson = objectMapper.writeValueAsString(employees);

        mockMvc.perform(get(BASE_URL + "/match/{prefix}", prefix).contentType("application/json"))
                .andExpect(status().isOk())
                .andExpect(content().json(returnedJson));

        verify(employeeService).getEmployeesByPrefix(prefix);
    }

    @Test
    public void testAddEmployee() throws Exception {
        String requestBody = objectMapper.writeValueAsString(employeeDTO);

        mockMvc.perform(post(BASE_URL)
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isCreated());

        verify(employeeService).addEmployee(employeeDTO);
    }

    @Test
    public void testAddEmployeeAlreadyExists() throws Exception {
        employeeDTO.setMail("123456@pwr.edu.pl");
        Mockito.when(employeeService.addEmployee(employeeDTO)).thenThrow(new AlreadyExistsException());

        String requestBody = objectMapper.writeValueAsString(employeeDTO);

        mockMvc.perform(post(BASE_URL)
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isConflict());

        verify(employeeService).addEmployee(employeeDTO);
    }

    @Test
    public void testAddEmployeeWithStudentRole() throws Exception {
        employeeDTO.getRoles().clear();
        employeeDTO.getRoles().add(new RoleDTO("student"));
        Mockito.when(employeeService.addEmployee(employeeDTO)).thenThrow(new IllegalArgumentException());

        String requestBody = objectMapper.writeValueAsString(employeeDTO);

        mockMvc.perform(post(BASE_URL)
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isBadRequest());

        verify(employeeService).addEmployee(employeeDTO);
    }

    @Test
    public void testAddEmployeeWithoutExistingRole() throws Exception {
        employeeDTO.getRoles().clear();
        employeeDTO.getRoles().add(new RoleDTO("tester"));

        Mockito.when(employeeService.addEmployee(employeeDTO)).thenThrow(new NoSuchElementException());

        String requestBody = objectMapper.writeValueAsString(employeeDTO);

        mockMvc.perform(post(BASE_URL)
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isNotFound());

        verify(employeeService).addEmployee(employeeDTO);
    }

    @Test
    public void testUpdateEmployee() throws Exception {
        String mail = "123456@pwr.edu.pl";
        employeeDTO.setName("Updated");
        employee.setName("Updated");

        Mockito.when(employeeService.updateEmployee(mail, employeeDTO)).thenReturn(employee);

        String requestBody = objectMapper.writeValueAsString(employeeDTO);

        mockMvc.perform(put(BASE_URL + "/{id}", mail)
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isOk());

        verify(employeeService).updateEmployee(mail, employeeDTO);
    }

    @Test
    public void testUpdateEmployeeNotFound() throws Exception {
        String mail = "123456@pwr.edu.pl";

        Mockito.when(employeeService.updateEmployee(mail, employeeDTO)).thenThrow(new NotFoundException());

        String requestBody = objectMapper.writeValueAsString(employeeDTO);

        mockMvc.perform(put(BASE_URL + "/{id}", mail)
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isNotFound());

        verify(employeeService).updateEmployee(mail, employeeDTO);
    }

    @Test
    public void testUpdateEmployeeMail() throws Exception {
        String mail = "123456@pwr.edu.pl";

        Mockito.when(employeeService.updateEmployee(mail, employeeDTO)).thenThrow(new IllegalArgumentException());

        String requestBody = objectMapper.writeValueAsString(employeeDTO);

        mockMvc.perform(put(BASE_URL + "/{id}", mail)
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isBadRequest());

        verify(employeeService).updateEmployee(mail, employeeDTO);
    }

    @Test
    public void testDeleteEmployee() throws Exception {
        String mail = "123456@pwr.edu.pl";

        Mockito.when(employeeService.deleteEmployee(mail)).thenReturn(employee);

        String returnedJson = objectMapper.writeValueAsString(employee);

        mockMvc.perform(delete(BASE_URL + "/{id}", mail).contentType("application/json"))
                .andExpect(status().isOk())
                .andExpect(content().json(returnedJson));

        verify(employeeService).deleteEmployee(mail);
    }

    @Test
    public void testDeleteEmployeeNotFound() throws Exception {
        String mail = "123456@pwr.edu.pl";

        Mockito.when(employeeService.deleteEmployee(mail)).thenThrow(new NotFoundException());

        mockMvc.perform(delete(BASE_URL + "/{id}", mail).contentType("application/json"))
                .andExpect(status().isNotFound());

        verify(employeeService).deleteEmployee(mail);
    }

    @Test
    public void testDeleteEmployeeWhoCannotBeDeleted() throws Exception {
        String mail = "123456@pwr.edu.pl";

        Mockito.when(employeeService.deleteEmployee(mail)).thenThrow(new CannotDeleteException());

        mockMvc.perform(delete(BASE_URL + "/{id}", mail).contentType("application/json"))
                .andExpect(status().isMethodNotAllowed());

        verify(employeeService).deleteEmployee(mail);
    }
}