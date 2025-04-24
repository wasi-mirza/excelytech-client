const AdminNavbar = () => {
  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
      {/*Menu Sign to toggle the sidebar*/}
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link" data-widget="pushmenu" href="#" role="button">
            <i className="fas fa-bars" />
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;
