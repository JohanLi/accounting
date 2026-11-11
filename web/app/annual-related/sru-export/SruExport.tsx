import { Button } from '../../components/Button'
import { H2 } from '../../components/common/heading'

type Props = {
  selectedFiscalYear: number
}

export default function SruExport(props: Props) {
  const url = `/annual-related/sru-export?fiscalYear=${props.selectedFiscalYear}`

  return (
    <div className="mb-24">
      <H2>SRU for Inkomstdeklaration 2</H2>
      <div className="mt-4 flex space-x-4">
        <a href={`${url}&file=info`} download="INFO.SRU">
          <Button type="primary" text="Download INFO.SRU" />
        </a>
        <a href={`${url}&file=blanketter`} download="BLANKETTER.SRU">
          <Button type="primary" text="Download BLANKETTER.SRU" />
        </a>
      </div>
    </div>
  )
}
