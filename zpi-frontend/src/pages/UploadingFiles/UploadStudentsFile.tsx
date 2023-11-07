import { useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import Cookies from "js-cookie";
import handleSignOut from "../../auth/Logout";
import useAuth from "../../auth/useAuth";
import {useNavigate} from "react-router-dom";
import { InvalidStudentData } from '../../models/ImportedData';

import {useTranslation} from "react-i18next";

function UploadStudentFilePage() {
  // @ts-ignore
  const { auth, setAuth } = useAuth();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [duplicateFilesError, setDuplicateFilesError] = useState<string | null>(null);
  const [duplicateErrorMessageVisible, setDuplicateErrorMessageVisible] = useState(false);
  const [uploadErrorMessageVisible, setUploadErrorMessageVisible] = useState(false);

  const [invalidJsonData, setInvalidJsonData] = useState<InvalidStudentData | null>(null);
  const [sentData, setSentData] = useState(false);

  const [databaseRepetitions, setDatabaseRepetitions] = useState(false);
  const [invalidIndicesOpen, setInvalidIndicesOpen] = useState(false);
  const [invalidSurnamesOpen, setInvalidSurnamesOpen] = useState(false);
  const [invalidNamesOpen, setInvalidNamesOpen] = useState(false);
  const [invalidProgramsOpen, setInvalidProgramsOpen] = useState(false);
  const [invalidCyclesOpen, setInvalidCyclesOpen] = useState(false);
  const [invalidStatusesOpen, setInvalidStatusesOpen] = useState(false);

  const invalidDataList = [
    {
      title: 'Rekordy, które znajdowały się już w bazie danych',
      data: invalidJsonData?.database_repetitions,
      isOpen: databaseRepetitions,
      toggleOpen: () => setDatabaseRepetitions(!databaseRepetitions)
    },
    {
      title: 'Niepoprawne indeksy',
      data: invalidJsonData?.invalid_indices,
      isOpen: invalidIndicesOpen,
      toggleOpen: () => setInvalidIndicesOpen(!invalidIndicesOpen)
    },
    {
      title: 'Niepoprawne nazwiska',
      data: invalidJsonData?.invalid_surnames,
      isOpen: invalidSurnamesOpen,
      toggleOpen: () => setInvalidSurnamesOpen(!invalidSurnamesOpen)
    },
    {
      title: 'Niepoprawne imiona',
      data: invalidJsonData?.invalid_names,
      isOpen: invalidNamesOpen,
      toggleOpen: () => setInvalidNamesOpen(!invalidNamesOpen)
    },
    {
      title: 'Niepoprawne programy',
      data: invalidJsonData?.invalid_programs,
      isOpen: invalidProgramsOpen,
      toggleOpen: () => setInvalidProgramsOpen(!invalidProgramsOpen)
    },
    {
      title: 'Niepoprawne cykle nauczania',
      data: invalidJsonData?.invalid_cycles,
      isOpen: invalidCyclesOpen,
      toggleOpen: () => setInvalidCyclesOpen(!invalidCyclesOpen)
    },
    {
      title: 'Niepoprawne statusy',
      data: invalidJsonData?.invalid_statuses,
      isOpen: invalidStatusesOpen,
      toggleOpen: () => setInvalidStatusesOpen(!invalidStatusesOpen)
    }
  ]


  setTimeout(() => {
    setDuplicateErrorMessageVisible(false);
  }, 20000);

  setTimeout(() => {
    setUploadErrorMessageVisible(false);
  }, 20000);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setDuplicateFilesError(null);
    const newFiles = acceptedFiles.filter(
      (file) => !selectedFiles.some((existingFile) => (existingFile.name === file.name))
    );
    if (newFiles.length != acceptedFiles.length){
      setDuplicateFilesError(t('uploadFiles.duplicatedFileError'));
      setDuplicateErrorMessageVisible(true);
    }
    setSelectedFiles([...selectedFiles, ...newFiles]);
    setButtonDisabled(false);
  }, [selectedFiles]);

  const deleteFile = (fileToDelete: File) => {
    const updatedFiles = selectedFiles.filter((file) => file !== fileToDelete);
    setSelectedFiles(updatedFiles);
    if (updatedFiles.length === 0) {
      setButtonDisabled(true);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleUpload = () => {
    setUploadError(null);
    selectedFiles.forEach((file) => {
      var size = +((file.size / (1024*1024)).toFixed(2))
      if (size > 5){
        const errorMessage = t('uploadFiles.tooBigFileError', {fileName: file.name, size: size});
        console.log(errorMessage);
        setUploadError(errorMessage);
        setUploadErrorMessageVisible(true);
        return;
      }
      const formData = new FormData();
      formData.append('file', file);

      axios
        .post('http://localhost:8080/file/student', formData, {
            headers: {
                'Authorization': `Bearer ${Cookies.get('google_token')}`
            },
        })
        .then((response) => {
          console.log('Przesłano plik:', response.data.message);
          const invalidData = JSON.parse(response.data.invalidData);
          setInvalidJsonData(invalidData);
          setSentData(true);
        })
        .catch((error) => {
          setUploadError(t('uploadFiles.filesNotSentError'));
          setUploadErrorMessageVisible(true);
          setSentData(false);
          console.error('Nie udało się przesłać plików', error);
          if (error.response.status === 401 || error.response.status === 403) {
            setAuth({ ...auth, reasonOfLogout: 'token_expired' });
            handleSignOut(navigate);
          }
        });
    });
    setSelectedFiles([]);
    setButtonDisabled(true);
  };

  return (
    <div className="container d-flex justify-content-center mt-5 mb-5">
      <div
        className="border p-4 rounded shadow-lg"
        style={{
          width: '80%',
          maxWidth: '100%',
          height: '70%',
          maxHeight: '100%',
          overflowX: 'hidden',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>

        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>{t('uploadFiles.attach')}</h2>
            <button type="button" className="custom-button another-color" onClick={() => navigate(-1)}>
              &larr; {t('general.management.goBack')}
            </button>
          </div>
            <div {...getRootProps()} className="dropzone">
              <input {...getInputProps()} />
              <p>{t('uploadFiles.instruction')}</p>
            </div>
            {duplicateFilesError && duplicateErrorMessageVisible && (
              <div className="alert alert-danger mt-3" role="alert">
                {duplicateFilesError}
              </div>
            )}
          {selectedFiles.length > 0 && (
            <section style={{maxHeight: '40%', overflow: 'auto'}}>
              <h4>{t('uploadFiles.chosenFiles')}:</h4>
              <ul className="list-group mb-3" style={{ flexWrap: 'wrap', overflow: 'auto' }}>
                {selectedFiles.map((file, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center mb-2 border">
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </span>
                    <button
                      className="btn btn-danger btn-sm custom-pwr-button"
                      onClick={() => deleteFile(file)}
                    >
                        {t('general.management.delete')}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {uploadError && uploadErrorMessageVisible && (
            <div className="alert alert-danger" role="alert">
              {uploadError}
            </div>
          )}
          <button onClick={handleUpload} disabled={buttonDisabled} className="btn btn-primary mt-2 custom-pwr-button">
              {t('uploadFiles.sendFiles')}
          </button>
        </div>

    {sentData && (
      <div
        className="container d-flex justify-content-center mt-5"
      >
      <div
        className="border p-4 rounded shadow-lg"
        style={{
          width: '90%',
          maxWidth: '100%',
          height: '60%',
          maxHeight: '100%',
          overflowX: 'hidden',
          overflowY: 'hidden',
          marginBottom: '10px',
          display: 'block'
          }}>
        <h4>Niepoprawne dane:</h4>
        <div style={{ overflow: 'auto', height: '100%', maxHeight: '100%' }}>
          <ul className="list-group">
            {invalidDataList.map((item, index) => (
              item.data && item.data.length > 0 ? (
                <li className="list-group-item mb-2 border" key={index}>
                  <div>
                  <div onClick={item.toggleOpen}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{item.title}</span>
                      <span>{item.data.length}</span>
                    </div>
                  </div>
                  <div className={`collapse ${item.isOpen ? 'show' : ''}`} style={{ height: '100%', maxHeight: '100%', overflowX: 'auto', overflowY: 'hidden'}}>
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th style={{ width: '4%' }}>Indeks</th>
                          <th style={{ width: '48%' }}>Nazwisko</th>
                          <th style={{ width: '48%' }}>Imię</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.data?.map((student, index) => (
                          <tr key={student.index}>
                            <td>{student.index}</td>
                            <td>{student.surname}</td>
                            <td>{student.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </div>
                </li>
              ) : null
            ))}
          </ul>

        </div>
      </div>
    </div>

  );
}

export default UploadStudentFilePage;
