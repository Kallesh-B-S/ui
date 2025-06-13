import { useEffect } from "react"
import Header from "../component/common/Header"
import { useNavigate } from "react-router-dom";
import type { AxiosRequestConfig } from "axios";
import axios from "axios";

const Home = (
    { loggedIn, setLoggedIn, logo, setLoggedInEmail, setLogo, loggedInEmail }:
        {
            loggedIn: boolean,
            setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>,
            logo: string,
            setLoggedInEmail: React.Dispatch<React.SetStateAction<string>>,
            setLogo: React.Dispatch<React.SetStateAction<string>>,
            loggedInEmail: string
        }) => {

    const navigate = useNavigate();

    useEffect(() => {
        console.log(loggedIn);

        if (!loggedIn) {
            navigate('/login');
        }
    }, [loggedIn])

    useEffect(() => {
        const fetchUserDetails = async () => {
            const options1: AxiosRequestConfig = {
                method: 'GET',
                url: `http://localhost:3006/GetUserDetails/${loggedInEmail}`,
                withCredentials: true
            };

            try {
                const { data } = await axios.request(options1);
                console.log(data);
                if (data.userDetails.LOGONAME) {
                    setLogo(data.userDetails.LOGONAME);
                }
            } catch (error: any) {
                console.log("Error while logging........");
                console.log(error.message);
                console.log("Error while logging........");
            }
        };

        fetchUserDetails();
    }, [loggedInEmail]); // Include dependencies like loggedInEmail

    return (
        <div>
            <Header logoUrl={`/images/logos/${logo}`} userEmail={''} navigateTo={''} logout={''} setLoggedIn={setLoggedIn} setLoggedInEmail={setLoggedInEmail} />
        </div>
    )
}

export default Home
