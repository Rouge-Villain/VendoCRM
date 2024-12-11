import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"
import PropTypes from "prop-types"

const AspectRatio = AspectRatioPrimitive.Root

AspectRatio.propTypes = {
  ratio: PropTypes.number,
  children: PropTypes.node
}

export { AspectRatio }
