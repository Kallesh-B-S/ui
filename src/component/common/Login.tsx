import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from "../../store";
import { loginUser } from "../../store/authSlice";



const Login = (
    { setLoggedIn, setLogo, setLoggedInEmail, loggedInEmail }
        : {
            setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>,
            setLogo: React.Dispatch<React.SetStateAction<string>>,
            setLoggedInEmail: React.Dispatch<React.SetStateAction<string>>,
            loggedInEmail: string

        }
) => {

    const navigate = useNavigate();
    // const dispatch = useDispatch<AppDispatch>();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({ mode: "onChange" });

    const onSubmit = (data: any) => {
        console.log("Form submitted:", data);
        // Handle authentication here
        handleLogin(data);

    };


    const setEmail = async (email: string) => {
        console.log('setting email ....');
        
        setLoggedInEmail(email);
    }

    const handleLogin = async (data: any) => {

        // dispatch(loginUser({ username: data.username, password: data.password }))
        //     .unwrap()
        //     .then(() => navigate("/home"))
        //     .catch(() => {
        //         alert("Login failed")
        //     });

        const options1: AxiosRequestConfig = {
            method: 'POST',
            url: 'http://localhost:3006/login',
            headers: {
                'Content-Type': 'application/json',
            },
            data: { P_EMAILADDR: data.username, P_PASSWORD: data.password },
            withCredentials: true
        };

        try {
            const { data } = await axios.request(options1);
            console.log(data);
            if (data.statusCode === 200) {
                await setEmail(data.email)
                console.log(data.email);
                
                setLoggedIn(true);
                navigate('/home');
            }
        } catch (error: any) {
            console.log("Error while logging........");
            console.log(error.message);
            console.log("Error while logging........");
        }
    }

    return (
        <div className="flex min-h-[85vh] bg-gray-500 mx-[5%] mt-[1.6%]">
            {/* Login card */}
            <div className="flex-1 max-w-[564px] p-8 flex flex-col justify-center bg-white shadow-lg">
                {/* Optional logo */}
                {/* <div className="text-center mb-4">
          <img src="images/logo.jpeg" alt="USCIB Logo" className="mx-auto max-w-[120px]" />
        </div> */}

                {/* Optional welcome title */}
                {/* <h2 className="text-center text-[#597b7c] mb-2 text-xl font-semibold">
          Welcome to USCIB Carnet Portal!
        </h2> */}

                <h3 className="text-center text-gray-600 text-base mb-8">
                    ATA Carnet: Your Passport for Duty-Free Global Trade
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                    <div>
                        <label className="block mb-1 text-gray-700">Username</label>
                        <div className="relative">
                            <input
                                {...register("username", { required: true })}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                                placeholder="Enter username"
                            />
                            <span className="absolute right-3 top-2.5 text-gray-400">
                                <i className="fas fa-user"></i>
                            </span>
                        </div>
                        {errors.username && (
                            <p className="text-red-600 text-sm mt-1">Username is required</p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-1 text-gray-700">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                {...register("password", { required: true })}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                                placeholder="Enter password"
                            />
                            <span className="absolute right-3 top-2.5 text-gray-400">
                                <i className="fas fa-lock"></i>
                            </span>
                        </div>
                        {errors.password && (
                            <p className="text-red-600 text-sm mt-1">Password is required</p>
                        )}
                    </div>

                    <div className="text-right -mt-4">
                        <a href="#" className="text-sm text-gray-600 hover:underline">
                            Forgot your password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={!isValid}
                        className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        Sign In
                    </button>

                    {/* Optional error message */}
                    {/* <p className="text-center text-red-600 mt-2">Invalid credentials</p> */}
                </form>
            </div>

            {/* Info section */}
            <div className="flex-1 p-16 bg-[#597b7c] text-white flex flex-col justify-center max-md:hidden">
                <h3 className="text-3xl mb-6 font-bold">ATA Carnet</h3>
                <p className="text-base leading-relaxed mb-4">
                    Also known as the "Merchandise Passport," is an international customs document that simplifies
                    temporary exports to over 79 countries and territories. It allows businesses to explore new
                    markets, showcase products at trade shows, and attend global conferences without paying duties
                    or taxes.
                </p>
                <p className="text-base leading-relaxed">
                    It simplifies customs procedures for the temporary movement of goods and allows goods to enter
                    Customs territories of the ATA Carnet system free of customs duties and taxes for up to one
                    year.
                </p>
            </div>
        </div>
    );
};

export default Login;
