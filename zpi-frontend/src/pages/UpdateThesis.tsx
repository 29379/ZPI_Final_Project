import React, { useRef, useState, useEffect, } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { AddUpdateThesisProps, SupervisorData, StatusEnum } from '../utils/types';
import '../App.css'


function UpdateThesisPage({ role, mail }: AddUpdateThesisProps) {
  const namePLRef = useRef<HTMLTextAreaElement | null>(null);
  const nameENRef = useRef<HTMLTextAreaElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  
  const [suggestions, setSuggestions] = useState<SupervisorData[]>([]);
  const [supervisorError, setSupervisorError] = useState<string | null>(null);

  const { thesisId } = useParams();

  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    namePL: '',
    nameEN: '',
    description: '',
    num_people: '4',
    supervisorMail: '',
    supervisor: {} as SupervisorData,
    faculty: '',
    field: '',
    edu_cycle: '',
    status: '',
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await Axios.get(`http://localhost:8080/thesis/${thesisId}`);
        if (response.status === 200) {
          const existingThesisData = response.data; 
          setFormState(existingThesisData);

          if (role === 'employee') {
            setFormState((prevState) => ({
              ...prevState,
              supervisorMail: mail!,
            }));
          } 
          else {
            setFormState((prevState) => ({
              ...prevState,
              supervisorMail: '',
            }));
          }

          return response.data.status;
        }
      } catch (error) {
        console.error('Error fetching thesis status:', error);
      }
      return null; 
    };
  
    const checkAuthorization = async () => {
      const status = await fetchStatus();
      
      if (role === 'employee' && (status !== 'DRAFT' && status !== 'Draft')) {
        navigate('/unauthorized');
      }
    };
  
    checkAuthorization();
  }, [role]);
  
  

  const fetchSupervisor = async (supervisorMail: string): Promise<SupervisorData | null> => {
    try{
      const response = await fetch(`http://localhost:8080/employee/${supervisorMail}`);

      if (response.ok){
        const supervisorData: SupervisorData = await response.json();
        return supervisorData;
      }
      return null;
    }
    catch (error) {
      console.error("Error fetching supervisor data: ", error);
      throw error;
    }
  }

  const fetchMatchingEmployees = async (supervisorMail: string): Promise<SupervisorData[] | null> => {
    try {
      const response = await fetch(`http://localhost:8080/employee/match/${supervisorMail}`);
  
      if (response.ok) {
        const supervisorData: SupervisorData[] = await response.json();
        return supervisorData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching supervisor data: ", error);
      throw(error)
    }
  };

  const handleOptionSelect = (value: string) => {
    const selectedStatus = value || '';
    setFormState({
      ...formState,
      status: value,
    });
    setShowDropdown(false);
  };

  const handleInputClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleTextAreaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    textareaRef: React.RefObject<HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleBlurSupervisor = async (event: React.FocusEvent<HTMLInputElement>) => {
    const supervisorMail = event.target.value;

    if (supervisorMail) {
      try {
        const supervisorData = await fetchSupervisor(supervisorMail);

        if (supervisorData != null) {
          setFormState({
            ...formState,
            supervisor: supervisorData,
          });
          setSupervisorError(null);
        } else {
          setSupervisorError('Supervisor does not exist in the database');
        }
      } catch (error) {
        setSupervisorError('Error fetching supervisor data');
        console.log('Error fetching supervisor data: ', error);
      }
    }
  };

  const handleSuggestionClick = (selectedEmployee: SupervisorData) => {
    const selectedMail = selectedEmployee.mail || '';
    setFormState({
      ...formState,
      supervisorMail: selectedMail,
      supervisor: selectedEmployee,
    });
    setSuggestions([]);
  };

  const handleSupervisorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });

    if (name === 'supervisorMail') {
      fetchMatchingEmployees(value).then((matchingEmployees) => {
        if (matchingEmployees) {
          setSuggestions(matchingEmployees);
        } else {
          setSuggestions([]);
          console.log('Supervisor does not exist in the database');
        }
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent, status: string) => {
    event.preventDefault();

    const formData = {
      namePL: formState.namePL,
      nameEN: formState.nameEN,
      description: formState.description,
      num_people: parseInt(formState.num_people, 10),
      supervisor: {
        mail: formState.supervisorMail,
        name: formState.supervisor.name,
        surname: formState.supervisor.surname,
        role: formState.supervisor.role,
        department_symbol: formState.supervisor.department_symbol,
        title: formState.supervisor.title,
      },
      faculty: formState.faculty,
      field: formState.field,
      edu_cycle: formState.edu_cycle,
      status: formState.status,
    };

    console.log(formData);

    try {
      const response = await Axios.put(`http://localhost:8080/thesis/${thesisId}`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        console.log('Request was successful');
      } else {
        console.log('PUT request was not successful');
      }
    } catch (error) {
      console.error('An error occurred in PUT request:', error);
    }
};


  return (
    <div className="container mt-5">
      <h2>Edytuj temat</h2>
      <form onSubmit={(event) => handleSubmit(event, formState.status)}>
        <div className="mb-3">
          <label htmlFor="namePL">Tytuł (PL):</label>
          <textarea
            className="form-control resizable-input"
            id="namePL"
            name="namePL"
            value={formState.namePL}
            onChange={(event) => handleTextAreaChange(event, namePLRef)}
            maxLength={200}
            ref={namePLRef}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="nameEN">Tytuł (EN):</label>
          <textarea
            className="form-control resizable-input"
            id="nameEN"
            name="nameEN"
            value={formState.nameEN}
            onChange={(event) => handleTextAreaChange(event, nameENRef)}
            maxLength={200}
            ref={nameENRef}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description">Opis:</label>
          <textarea
            className="form-control resizable-input"
            id="description"
            name="description"
            value={formState.description}
            onChange={(event) => handleTextAreaChange(event, descriptionRef)}
            maxLength={1000}
            ref={descriptionRef}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="num_people">Limit osób:</label>
          <input
            type="number"
            className="form-control"
            id="num_people"
            name="num_people"
            value={formState.num_people}
            onChange={handleInputChange}
            min={3}
            max={6}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="supervisor">Prowadzący:</label>
          {role === 'employee' && (
            <input
              type="text"
              className="form-control"
              id="supervisor"
              name="supervisor"
              value={formState.supervisorMail}
              readOnly
              disabled
            />
          )}
          {role === 'admin' && (
            <>
              <input
                type="text"
                className="form-control"
                id="supervisorMail"
                name="supervisorMail"
                value={formState.supervisorMail}
                onChange={handleSupervisorInputChange}
                onBlur={handleBlurSupervisor}
              />
              {supervisorError && <div className="text-danger">{supervisorError}</div>}
            </>
          )}
          {suggestions.length > 0 && (
            <ul className="list-group">
              {suggestions.map((employee) => (
                <li
                  key={employee.mail}
                  className="list-group-item list-group-item-hover"
                  onClick={() => handleSuggestionClick(employee)}
                >
                  {employee.title} {employee.name} {employee.surname} - {employee.mail}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="faculty">Kierunki:</label>
          <input
            type="text"
            className="form-control"
            id="faculty"
            name="faculty"
            value={formState.faculty}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="field">Specjalność:</label>
          <input
            type="text"
            className="form-control"
            id="field"
            name="field"
            value={formState.field}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="edu_cycle">Cykl edukacyjny:</label>
          <input
            type="text"
            className="form-control"
            id="edu_cycle"
            name="edu_cycle"
            value={formState.edu_cycle}
            onChange={handleInputChange}
            minLength={9}
            maxLength={11}
          />
        </div>
        {role == 'admin' && (
            <div className="mb-3">
            <label htmlFor="status">Status:</label>
            
              <input
                type="text"
                id="status"
                name="status"
                value={formState.status}
                onClick={handleInputClick}
                readOnly
                style={{ outline: 'none' }}
                className="form-control"
              />
              {showDropdown && (
                <ul className="list-group">
                  {Object.values(StatusEnum).map((cycle, index) => (
                    <li
                      key={index}
                      className="list-group-item list-group-item-hover"
                      onClick={() => handleOptionSelect(cycle)}
                    >
                      {cycle}
                    </li>
                  ))}
                </ul>
              )}
          </div>

        )}

        {role === 'admin' && (
        <button
            type="submit"
            className={`btn btn-primary ${supervisorError ? 'disabled' : ''}`}
            style={{ marginRight: '10px' }}
            onClick={(event) => handleSubmit(event, formState.status)}
        >
            Zapisz zmiany
        </button>
        )}
        {role === 'employee' && (
        <button
            type="submit"
            className={`btn btn-primary ${supervisorError ? 'disabled' : ''}`}
            style={{ marginRight: '10px' }}
            onClick={(event) => handleSubmit(event, formState.status)}
        >
            Zapisz zmiany
        </button>
        )}

        {supervisorError && (
          <div className="text-danger mt-2">{supervisorError}</div>
        )}
      </form>
    </div>
  )
}

export default UpdateThesisPage;