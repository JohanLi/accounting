import { H2 } from '../../components/common/heading'
import { Button } from '../../components/Button'

type Props = {
  selectedFiscalYear: number
}

export default function SieExport(props: Props) {
  const fileName = `${props.selectedFiscalYear}.sie`
  const url = `/annual-related/sie-export?fiscalYear=${props.selectedFiscalYear}`

  return (
    <div>
      <H2>SIE for generating annual report</H2>
      <div className="mt-4 flex space-x-4">
        <a href={url} download={fileName}>
          <Button type="primary" text={`Download ${fileName}`} />
        </a>
        <a href={url}>
          <Button type="secondary" text={`Preview ${fileName}`} />
        </a>
      </div>
    </div>
  )
}
