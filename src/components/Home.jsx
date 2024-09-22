import React, { useEffect, useState } from 'react'
import axios from 'axios'
import RepoInfo from './RepoInfo'
import { Link, NavLink } from 'react-router-dom'
// import Image from './Image'

const Home = () => {
    const [data, setdata] = useState("")
    useEffect(() => {
        const githubData = async () => {
            const risponseData = await axios.get('https://api.github.com/users/rhm856591')
            setdata(risponseData.data)

        }
        githubData()
    }, [])

    if (!data) return <h1>Loading...</h1>

    const gitName = data?.name
    const name = gitName.split(" ")
    return (
        <>
            <Link to='/repo'>If you want to see my repo</Link>
            {/* <NavLink to={<RepoInfo/>} >If you want to see my repo</NavLink> */}
            <h1>Hello from {name[0]} GitHub API {data?.login}</h1>
            <h3>My Name is: {data?.name}</h3>

            <img className='Image' src={data?.avatar_url} alt="" />
            <p>Public Repos: {data?.public_repos}</p>
            <p>Bio: {data?.bio}</p>
            <p>Followers: {data?.followers}</p>

            <p>
                I am created this GitHub Account on: {new Date(data?.created_at).toLocaleDateString()}
            </p>
            {/* <Image/> */}
        </>
    )
}

export default Home