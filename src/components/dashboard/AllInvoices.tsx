import { AllInvoicesDataTable } from "../dynamic-table/invoices/all-invoices-table";
import {
	AllInvoicesTableColumns,
	Invoice,
} from "../dynamic-table/invoices/columns";

interface AllInvoicesProps {
	invoices: Invoice[];
}

const AllInvoices = (props: AllInvoicesProps) => {
	const columns = AllInvoicesTableColumns;
	return (
		<div className="w-full h-full flex flex-col gap-2">
			<div className="py-4 px-2 flex flex-col gap-2">
				<p className="text-3xl font-bold">Review Past Orders 📝</p>
				<p className="text-md font-light">
					Click on more options to view your invoice.
				</p>
			</div>

			<div className="h-full w-full">
				<AllInvoicesDataTable columns={columns} data={props.invoices} />
			</div>
		</div>
	);
};

export default AllInvoices;
