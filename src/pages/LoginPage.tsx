import Footer from "../component/common/Footer"
import Login from "../component/common/Login";

const LoginPage = (
    { setLoggedIn, setLogo, setLoggedInEmail,loggedInEmail }:
        {
            setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>,
            setLogo: React.Dispatch<React.SetStateAction<string>>,
            setLoggedInEmail: React.Dispatch<React.SetStateAction<string>>,
            loggedInEmail:string
        }
) => {
    return (
        <>
            <div>
                <Login setLoggedIn={setLoggedIn} setLogo={setLogo} setLoggedInEmail={setLoggedInEmail} loggedInEmail={loggedInEmail} />
                <Footer />
            </div>
        </>
    )
}

export default LoginPage;
