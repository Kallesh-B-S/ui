import { useSelector } from "react-redux"
import Header from "../component/common/Header"
import type { AppDispatch, RootState } from "../store"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { getUserDetails } from "../store/homeSlice"
import BeautifulTable from "../component/common/BeautifulTable"
import BeautifulTable2 from "../component/common/BeautifulTable2"
import { ThemeService } from '../../themeService';

const Home = () => {
    const authState = useSelector((state: RootState) => state.auth)
    const homeState = useSelector((state: RootState) => state.home)
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        if (authState.loggedIn === false) {
            navigate('/login')
        }
    }, [authState.loggedIn, navigate])

    useEffect(() => {
        if (authState.user?.email) {
            dispatch(getUserDetails(authState.user.email))
        }
    }, [])

    useEffect(() => {
        console.log("tableData : ", homeState.tableData);

    }, [homeState.tableData])

    useEffect(() => {
        if (homeState.data?.THEMENAME) {
            ThemeService.setTheme(homeState.data.THEMENAME ?? 'default'); // Switch theme by setting the CSS file
        }
    }, [homeState.data])
    return (
        <div>
            <Header />
            {/* <BeautifulTable /> */}
            <BeautifulTable2 defaultData={homeState.tableData && homeState.tableData.length > 0 ? homeState.tableData : []} />
        </div>
    )
}

export default Home
