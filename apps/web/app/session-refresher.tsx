'use client';
import { useEffect } from 'react';
import { apiUrl } from './api';

export default function SessionRefresher(){
  useEffect(()=>{
    const refresh=async()=>{const response=await fetch(`${apiUrl}/auth/refresh`,{method:'POST',credentials:'include'});if(response.ok){const data=await response.json();sessionStorage.setItem('accessToken',data.accessToken);sessionStorage.setItem('user',JSON.stringify(data.user));}};
    const interval=window.setInterval(refresh,1000*60*12);
    return()=>window.clearInterval(interval);
  },[]);
  return null;
}
