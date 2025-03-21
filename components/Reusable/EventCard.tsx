"use client";
import React from 'react'
import Image from 'next/image';
import { CardBody, CardContainer, CardItem } from "../ui/3d-card";
import { Event } from '@/app/page';

const EventCard = ({events}:{events:Event}) => {
  // console.log(events.mainImage)
  return (
    <>
    <div data-aos="fade-up">
        <CardContainer className="inter-var">
            <CardBody className=" object-contain md:bg-gray-100 relative group/card shadow dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto md:w-[310px] lg:w-[300px] sm:w-[270px] md:h-fit border-black rounded-xl md:p-3 p-2 border">
              <CardItem translateZ="20" className="text-sm md:text-xl font-bold text-black dark:text-white w-full">
                <CardItem translateZ="20" className="mt-4 w-full">
                  <Image src={events.mainImage} height="1000" width="1000" className="object-contain rounded-xl group-hover/card:shadow-xl md:h-[150px]" alt="thumbnail"/>
                </CardItem>
                <p className='truncate-line-3 md:uppercase my-4 text-[17px] text-[#f39e2f] md:text-[20px] md:mt-4 font-heading'>
                  {events.title}
                </p>
                </CardItem>
                  <CardItem as="p" translateZ="20" className="md:flex text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300">
                  <p className="text-[10px] md:text-[12px] text-gray-700 line-clamp-3 h-fit font-typer">
                    <p>
                    <p className='font-bold'>{events.title} - <span className='font-normal'>{events.domain}</span></p>
                    </p>
                    <p>
                      <p className='font-bold'>Date - <span className='font-normal'>{events.date}</span></p>
                    </p>
                    <p>
                    <p className='font-bold'>Candidates - <span className='font-normal'>{events.candidates}+</span></p>
                    </p>
                    </p>
                </CardItem>
              <div className="flex justify-end items-center mt-6">
              </div>
            </CardBody>
        </CardContainer>
    </div>
    </>
  )
}

export default EventCard
