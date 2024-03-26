import { IMessage } from '@/context/reducers/interfaces'
import React from 'react'

const Card = ({message}:{message:IMessage}) => {
  return (
    <div>
     {message.type}

          
    </div>
  )
}

export default Card