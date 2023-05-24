import { UserCircle } from 'phosphor-react'
import React, { useEffect, useState } from 'react'
import api from '../../services/api';
import getAuthHeader from '../../services/auth';
import Button from '../Button';
import Heading from '../Heading';
import Text from '../Text'
import {Avatar} from '../Avatar';

export default function Profiles() {
  const user = localStorage.getItem("user")
  const profileID = localStorage.getItem("profile") as string
  const authHeader = getAuthHeader();
  const [profiles, setProfiles] = useState<ProfileProps[]> ([]);
  const [userAvatar, setUserAvatar] = useState<string>("");
 
  interface ProfileProps{
    id: string,
    username: string,
    followers : string[],
    followButtonDisabled: boolean,
    avatar : string
  }

  useEffect(()=>{
    const getProfiles = async () =>{
        try {
           const response = await api.get('/api/v1/profiles', authHeader );
          const profiles = response.data.map((profile: ProfileProps) => {
           if(profile.id == profileID) setUserAvatar(profile.avatar)
                return {
                    ...profile, 
                    followButtonDisabled: profile.followers.includes(profileID)
                };
              });

            setProfiles(profiles)
            console.log(response.data);
        } catch (error) {
            console.error(error)
        }
    }
    getProfiles()
  }, [])

  async function handleFollow(userID: string ){
    try {
        await api.post(`api/v1/profiles/${userID}/follow`, {id:profileID}, authHeader);
        changeButtonStatus(userID, true);
    } catch (error:any) {
        console.error(error.response.data);
    }
  }

  async function handleUnfollow(userID: string ){
    try {
        await api.post(`api/v1/profiles/${userID}/follow`, {id:profileID}, authHeader);
        changeButtonStatus(userID, false);
    } catch (error:any) {
        console.error(error.response.data);
    }
  }

  function changeButtonStatus(userID: string, buttonDisabled: boolean ) {
    setProfiles((profiles) => {
        const newProfiles = profiles.map((profile) => {

            if (profile.id == userID) {
                profile.followButtonDisabled = buttonDisabled;
            }
            return profile;
        });
        return [ ...newProfiles];
    })
  }
  return (
    <div className='basis-5/6'>
      <Heading className="border-b border-slate-400 mt-4">
        <Text size="lg" className="font-extrabold ml-5">
          Amigos
        </Text>
        <div className="flex flex-row items-center ml-5 my-2">
        {userAvatar != "" || userAvatar.length > 0 ? (
        <Avatar src={userAvatar} />
      ) : (
        <UserCircle size={80} height="light" className="text-slate-50" />
      )}
          <Text className="font-extrabold ml-2">{user}</Text>
        </div>
      </Heading>
      <ul>
      {profiles.map((profile) => (
        <li className=' border-b border-slate-400 mt-4 pl-5' key={profile.id}>
         <div className="flex flex-row items-center ">
         {profile.avatar != "" || profile.avatar.length > 0 ? (
        <Avatar src={profile.avatar} />
      ) : (
        <UserCircle size={80} height="light" className="text-slate-50" />
      )}
             <Text className="font-extrabold ml-2">{profile.username}</Text>
         </div>
         <footer className='mt-4 flex justify-start gap-4 mb-4'>
                 <Button type="submit" className='flex-none w-48' onClick={()=> handleFollow(profile.id) } disabled={profile.followButtonDisabled || profile.id == profileID}>Seguir</Button>
                  <button type='button' className='bg-zinc-500 px-5 h-12 rounded-md font-semibold hover:bg-zinc-600 focus:ring-2 ring-white' disabled={!profile.followButtonDisabled || profile.id == profileID} onClick={() => handleUnfollow(profile.id)}>Deixar de seguir</button>
        </footer>
        </li>
      ))}
    </ul>
    </div>
  );
}
