// assets
import logo from './../../assets/img/mirai-logo-transparent.png';
import './AppShell.css'

function AppShell(props) {
    return (
      <div className={"app-container"}>
        <div className={"app-header-container"}>
          <img id={"header-logo-img"} src={logo} />
        </div>
        <div className={"app-content"}>
          {props.children}
        </div>
      </div>
    )
  }
  
  export default AppShell;