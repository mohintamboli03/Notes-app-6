import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const PasswordInput = ({ value, onChange, placeholder }) => {

    const [isShowpassword, setIsShowpassword] = useState(false);

    const toggleShowPassword = () => {
        setIsShowpassword(!isShowpassword);
    };

    return (
        <div className='flex items-center bg-transparent border-[1.5px] px-5 rounded mb-3'>
            <input
                type={isShowpassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder || "password"}
                className='w-full text-sm bg-transparent py-3 mr-3 rounded outline-none'
            />

           { isShowpassword ? (  <FaRegEye
                size={22}
                className="text-primary cursor-pointer"
               onClick={()=>toggleShowPassword()}
            />
           ) : ( 
            <FaRegEyeSlash
            sizw={22}
            className='text-slate-500 cursor-pointer'
            onClick={()=>toggleShowPassword()}
            />
           )}

        </div>
    )
}

export default PasswordInput