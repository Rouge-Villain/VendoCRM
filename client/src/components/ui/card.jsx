import * as React from "react"
import PropTypes from 'prop-types'
import { cn } from "@/lib/utils"

const Card = React.forwardRef(function Card({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = "Card"
Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
}

const CardHeader = React.forwardRef(function CardHeader({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  )
})

CardHeader.displayName = "CardHeader"
CardHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
}

const CardTitle = React.forwardRef(function CardTitle({ className, children, ...props }, ref) {
  return (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
})

CardTitle.displayName = "CardTitle"
CardTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
}

const CardDescription = React.forwardRef(function CardDescription({ className, children, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
})

CardDescription.displayName = "CardDescription"
CardDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
}

const CardContent = React.forwardRef(function CardContent({ className, children, ...props }, ref) {
  return (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  )
})

CardContent.displayName = "CardContent"
CardContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
}

const CardFooter = React.forwardRef(function CardFooter({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  )
})

CardFooter.displayName = "CardFooter"
CardFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
