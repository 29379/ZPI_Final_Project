import React, { ReactNode, useState } from 'react'
import {Link, NavLink, useLocation, useNavigate} from "react-router-dom";
// @ts-ignore
import Cookies from "js-cookie";
import handleSignOut from "../auth/Logout";
import { Dropdown, Nav } from 'react-bootstrap';
import {Role} from "../models/Role";
import {useTranslation} from "react-i18next";

type NavigationProps = {} & {
    children?: ReactNode
}

const Navigation = ({ children }: NavigationProps) => {
    const [showNav, setShowNav] = useState(false);
    const { i18n, t } = useTranslation();
    const isLoggedIn = Cookies.get('user') !== undefined;
    const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') as string) : '';

    const location = useLocation();
    const navigate = useNavigate();
    const signOut = () => handleSignOut(navigate);
    const isLoginPage = location.pathname === '/login';

    const allowedPaths = [
        '/students',
        '/employees',
        '/faculties',
        '/fields',
        '/specializations',
        '/programs',
        '/cycles',
        '/departments'
      ];

      const isManagementActive = allowedPaths.some(path => location.pathname.startsWith(path));
    const onChangeLang = (lang: string) => {
        console.log(lang);
        if (lang !== i18n.language) {
            i18n.changeLanguage(lang);
            Cookies.set('lang', lang);
        }
    };

    return (
        <>
            <div className='container-fluid p-0'>
                <nav className="navbar navbar-expand-lg navbar-light bg-light p-0">
                    <div className="container">
                        <div className="me-auto"></div>

                        <ul className="navbar-nav mw-auto">
                            {isLoggedIn ? (
                                <li className="nav-item">
                                    <div className="nav-link">{user.name} {user.surname}</div>
                                </li>
                            ) : null}
                            <li className="nav-item">
                                <div className="nav-link">|</div>
                            </li>
                            <li className="nav-item">
                                <Link
                                    className={`nav-link ${i18n.language === 'pl' ? 'lang-link-active' : ''}`}
                                    onClick={() => onChangeLang('pl')}
                                    to={location.pathname}
                                >
                                    PL
                                </Link>
                            </li>
                            <li className="nav-item">
                                <div className="nav-link">&bull;</div>
                            </li>
                            <li className="nav-item">
                                <Link
                                    className={`nav-link ${i18n.language === 'en' ? 'lang-link-active' : ''}`}
                                    onClick={() => onChangeLang('en')}
                                    to={location.pathname}
                                >
                                    EN
                                </Link>
                            </li>
                            <li className="nav-item">
                                <div className="nav-link">|</div>
                            </li>
                            <li className="nav-item">
                                {isLoggedIn ? (
                                    <Link
                                        className="nav-link"
                                        to="login"
                                        onClick={signOut}
                                    >
                                        {t('navigation.logout')}
                                    </Link>
                                ) : (
                                    <NavLink
                                        className={({ isActive }) => isActive ? "nav-link active" :
                                            "nav-link"}
                                        to="login"
                                    >
                                        {t('navigation.login')}
                                    </NavLink>
                                )}
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
            <img
                src="images/logo-pwr-2016/logo PWr kolor poziom ang  bez tla.png"
                alt={t('navigation.imageAlt')}
                className='w-25 my-3 ps-4 pe-5'
            />
            <div className='container'>
            <div className={`container p-0 ${isLoginPage ? 'd-none' : ''}`}>
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <div className="container">
                        <Link className="navbar-brand" to="/">ZPI Helper</Link>
                        <button className="navbar-toggler" type="button" onClick={() => setShowNav(!showNav)}>
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className={`collapse navbar-collapse ${showNav ? 'show' : ''}`} id="navbarNav">
                            <ul className="navbar-nav me-auto">
                                <li className="nav-item">
                                    <NavLink className={({ isActive }) => isActive ?
                                        "nav-link active" : "nav-link"} to="/">{t('navigation.home')}</NavLink>
                                </li>
                                {isLoggedIn ? (
                                    <>
                                        <li className="nav-item">
                                            <NavLink className={({ isActive }) => isActive ?
                                                "nav-link active" : "nav-link"} to="/theses" >
                                                {t('general.university.theses')}
                                            </NavLink>
                                        </li>
                                        {user?.roles?.some((role: Role) => role.name === 'admin') ? (
                                            <li className="nav-item">
                                                <Dropdown as={Nav.Item}>
                                                    <Dropdown.Toggle as={Nav.Link} className={isManagementActive ? "active" : ""}>{t('navigation.manage')}</Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item as={Link} to="/students" className={location.pathname === '/students' ? "active" : ""}>
                                                            {t('general.people.students')}
                                                        </Dropdown.Item>
                                                        <Dropdown.Item as={Link} to="/employees" className={location.pathname === '/employees' ? "active" : ""}>
                                                            {t('general.people.employees')}
                                                        </Dropdown.Item>
                                                        <Dropdown.Item as={Link} to="/faculties" className={location.pathname === '/faculties' ? "active" : ""}>
                                                            {t('general.university.faculties')}
                                                        </Dropdown.Item>
                                                        <Dropdown.Item as={Link} to="/fields" className={location.pathname === '/fields' ? "active" : ""}>
                                                            {t('general.university.fields')}
                                                        </Dropdown.Item>
                                                        <Dropdown.Item as={Link} to="/specializations" className={location.pathname === '/specializations' ? "active" : ""}>
                                                            {t('general.university.specializations')}
                                                        </Dropdown.Item>
                                                        <Dropdown.Item as={Link} to="/programs" className={location.pathname === '/programs' ? "active" : ""}>
                                                            {t('general.university.studyPrograms')}
                                                        </Dropdown.Item>
                                                        <Dropdown.Item as={Link} to="/cycles" className={location.pathname === '/cycles' ? "active" : ""}>
                                                            {t('general.university.studyCycles')}
                                                        </Dropdown.Item>
                                                        <Dropdown.Item as={Link} to="/departments" className={location.pathname === '/departments' ? "active" : ""}>
                                                            {t('general.university.departments')}
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>

                                </li>
                                        ) : null}
                                        {user?.roles?.some((role: Role) => role.name === 'supervisor') ? (
                                            <li className="nav-item">
                                                <NavLink className={({ isActive }) => isActive ?
                                                    "nav-link active" : "nav-link"} to="/my">
                                                    {t('navigation.myTheses')}
                                                </NavLink>
                                            </li>
                                        ) : null}
                                    </>
                                ) : null}
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
                {children}
            </div>
        </>
    )
}

export default Navigation