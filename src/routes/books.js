import express from 'express';
import request from "request-promise";
import {parseString} from "xml2js";
import authenticate from '../middlewares/authenticate';

const router = express.Router();
router.use(authenticate);

router.get("/search", (req, res) => {
    request
        .get(
            `https://www.goodreads.com/search/index.xml?key=${process.env
                .GOODREADS_KEY}&q=${req.query.q}`
        )
        .then(result =>
            parseString(result, (err, goodreadsResult) =>
                res.json({
                    books: goodreadsResult.GoodreadsResponse.search[0].results[0].work.map(
                        work => ({
                            goodreadsId: work.best_book[0].id[0]._,
                            title: work.best_book[0].title[0],
                            authors: work.best_book[0].author[0].name[0],
                            covers: [work.best_book[0].image_url[0]]
                        })
                    )
                })
            )
        );
});
// router.get('/search', (req, res) => {
//     res.json({
//         books: [
//             {
//                 goodreadsId: 1,
//                 title: "1984",
//                 authors: "Orwell",
//                 covers: [
//                     "https://images.gr-assets.com/books/1348990566l/5470.jpg",
//                     "https://images.gr-assets.com/books/1504611957l/9577857.jpg"
//                 ],
//                 pages: 198
//             },
//             {
//                 goodreadsId: 2,
//                 title: "Three Men in a Boat",
//                 authors: "Jerome K. Jerome",
//                 covers: [
//                     "https://img10.360buyimg.com/n1/jfs/t706/67/1334437735/113573/9ed61e75/553065c4Na8e36015.jpg",
//                     "https://img11.360buyimg.com/n1/s200x200_jfs/t14647/81/1588713004/68447/c5b32082/5a52d1e9N88f50009.jpg"
//                 ],
//                 pages: 256
//             }
//         ]
//     })
// });

router.get("/fetchPages", (req, res) => {
    const goodreadsId = req.query.goodreadsId;

    request
        .get(
            `https://www.goodreads.com/book/show.xml?key=${process.env
                .GOODREADS_KEY}&id=${goodreadsId}`
        )
        .then(result =>
            parseString(result, (err, goodreadsResult) => {
                const numPages = goodreadsResult.GoodreadsResponse.book[0].num_pages[0];
                const pages = numPages ? parseInt(numPages, 10) : 0;
                res.json({
                    pages
                });
            })
        );
});
export default router;