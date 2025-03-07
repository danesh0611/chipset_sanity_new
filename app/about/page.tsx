import React, { Suspense } from 'react'
import  aboutusdata  from "../../public/svg/about_us.svg";
import Image from 'next/image';
import Timeline from '@/components/Reusable/TimeLine';
import ChitsetTshirt from '@/components/Reusable/ChitsetTshirt';
import PageLoader from '@/components/Reusable/PageLoader';
import image1 from "../../public/assets/LandingPagePic/macbookScreen.png"
export default async function about() {
  // await new Promise(resolve=>setTimeout(resolve,3000))
  
  return (
    <div className="overflow-hidden">
      <Suspense fallback={<PageLoader />}>
        <div className='w-full p-1 md:p-6 flex flex-col'>
        <div className='flex flex-col'>
        <div className='page2 p-4 flex flex-col'>

            <div data-aos="slide-up" className='slide1 flex flex-1 flex-col md:flex-row'>
              <div className='left flex flex-1 md:p-6 '>
                <div className='text-black font-heading uppercase font-extrabold md:text-2xl flex justify-center items-center w-full h-full'>
                <Timeline/>
                </div>
              </div>
              <div data-aos="fade-left" className='right  flex-1 my-6 md:flex justify-center items-center'>
                  <video className='w-[3000px] mix-blend-multiply h-full rounded-md overflow-hidden' autoPlay muted loop>
                    <source src={"https://res.cloudinary.com/ddu9vj21v/video/upload/v1738934976/hfmdhwbnki9o0gjgsjy1.mp4"} type="video/mp4"/>
                  </video>
              </div>
            </div>

            <div data-aos="slide-up" className='slide1 flex flex-1 flex-col md:flex-row-reverse'>
              <div className='left flex flex-1 md:p-6 '>
                <div className='text-black font-heading uppercase font-extrabold md:text-2xl flex justify-center items-center w-full h-full'>
                  How its going
                </div>
              </div>
              <div data-aos="fade-left" className='right  flex-1 my-6 md:flex justify-center items-center'>
              <video className='w-[3000px] mix-blend-multiply h-full rounded-md overflow-hidden' autoPlay muted loop>
                    <source src={"https://res.cloudinary.com/dzzvomj39/video/upload/v1714655870/Chipset_Intro_year_2019_hynpsl.mp4"} type="video/mp4"/>
                  </video>
              </div>
            </div>

            <div data-aos="slide-up" className='slide1 flex flex-1 flex-col md:flex-row'>
              <div className='left flex flex-1 md:p-6 '>
                <div className='text-black scale-75 md:scale-100 font-heading uppercase font-extrabold text-2xl flex justify-center items-center w-full h-full'>
                  How it Started
                </div>
              </div>
              <div data-aos="fade-left" className='right  flex-1 my-6 md:flex justify-center items-center'>
              <video className='w-[3000px] mix-blend-multiply h-full rounded-md overflow-hidden' autoPlay muted loop>
                    <source src={"https://res.cloudinary.com/dzzvomj39/video/upload/v1714401482/ogaxbzjyfd0bhhjgm7xg_gdi0dq.mp4"} type="video/mp4"/>
                  </video>
              </div>
            </div>

            <div data-aos="slide-up" className='slide1 flex flex-1 flex-col md:flex-row-reverse'>
              <div className='left flex flex-1 md:p-6 '>
                <div className='text-black font-heading uppercase font-extrabold md:text-2xl flex justify-center items-center w-full h-full'>
                  what we are
                </div>
              </div>
              <div data-aos="fade-left" className='right  flex-1 my-6 md:flex justify-center items-center'>
              <video className='w-[3000px] mix-blend-multiply h-full rounded-md overflow-hidden' autoPlay muted loop>
                <source src={"https://res.cloudinary.com/ddu9vj21v/video/upload/v1738935244/VID-20250206-WA0028_ar7yku.mp4"} type="video/mp4"/>
              </video>
              </div>
            </div>
        </div>
        </div>
        </div>
      </Suspense>
    </div>
  )
}


