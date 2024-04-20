import React, { Suspense } from 'react'
import  aboutusdata  from "../../public/svg/about_us.svg";
import Image from 'next/image';
import Timeline from '@/components/Reusable/TimeLine';
import ChitsetTshirt from '@/components/Reusable/ChitsetTshirt';
import PageLoader from '@/components/Reusable/PageLoader';
const about = () => {
  return (
    <div>

      <div className='w-full p-1 md:p-6 flex flex-col'>
        <div className='flex flex-col'>
          <div className='page2 p-4 flex flex-col'>
            <div className='flex flex-1 flex-col md:flex-row'>
              <div className='flex flex-1 md:p-6 '>
                <div className='flex flex-col'>
                    <p className='md:text-4xl font-extrabold text-xl md:font-semibold'><span className='font-heading'> What is </span>CH<span className='text-[#f6a339]'>i</span>PSET</p>
                    <p className='text-black lg:p-4 md:pt-2 md:text-[9px] text-center italic text-xs mt-2 lg:mt-12'>Keeping together is PROGRESS. Coming together is a BEGINNING. Working together is SUCCESS.</p>
                    <div className='2 md:hidden flex-1 my-6 flex justify-center items-center'>
                      <video className='w-[3000px] mix-blend-multiply h-full' autoPlay muted loop>
                        <source src={"https://res.cloudinary.com/ddeqh8bh3/video/upload/v1696062328/ogaxbzjyfd0bhhjgm7xg.mp4"} type="video/mp4"/>
                      </video>
                    </div>
                    <p className='font-typer text-xs md:text-[10px] lg:text-[13px] lg:text-md md:mt-4 lg:font-bold'>CHiPSET is a Collaboration of Hackers, Innovators, Programmers, Script writers, Entrepreuners, and Technocrats. We are a non-profit organization with a zeal for making changes in the world by harvesting talents of unique individuals cross all domains.We believe in building the world by building it’s forever recurring addition; a family of inquisitive minds.</p>
                </div>
              </div>
              <div data-aos="fade-left" className='2 hidden flex-1 my-6 md:flex justify-center items-center'>
                  <ChitsetTshirt/>
              </div>
            </div>
            <div data-aos="slide-up" className='flex justify-center'>
              <div className='hidden md:flex w-1/2 justify-center items-center'>
                <div className=''>
                  <video className='w-[3000px] mix-blend-multiply h-full' autoPlay muted loop>
                    <source src={"https://res.cloudinary.com/ddeqh8bh3/video/upload/v1696062328/ogaxbzjyfd0bhhjgm7xg.mp4"} type="video/mp4"/>
                  </video>
                </div>
              </div>
              <div className='md:w-1/2 mx-4'>
                <Timeline/>
              </div>
            </div>
          </div>
            </div>
          </div>
      {/* </Suspense> */}
    </div>
  )
}

export default about
