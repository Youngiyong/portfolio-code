package com.ant.controller;
import org.apache.http.HttpHost;
import org.elasticsearch.action.bulk.BulkRequest;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.client.indices.CreateIndexRequest;
import org.elasticsearch.client.indices.CreateIndexResponse;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.xcontent.XContentType;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.FieldSortBuilder;
import org.elasticsearch.search.sort.ScoreSortBuilder;
import org.elasticsearch.search.sort.SortOrder;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.elasticsearch.search.aggregations.bucket.terms.TermsAggregationBuilder;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;


@CrossOrigin(origins = "*", maxAge = 10000)
@RestController
@RequestMapping("/news")
public class ElasticSearchController {

	@Autowired
	RestHighLevelClient client;
	
	
	//id?????? 1??? ??????????????? ?????? static?????? ??????
		static int count;
		UUID uuidran = UUID.randomUUID();
		//RestHighLevelClient????????? ?????? Close??? ??????????????? ?????? ????????? ?????? ?????????
		//?????? ?????? Spring?????? Bean ?????????????????? destroymethod ????????? ???????????? ????????? ?????? ??? ??? ??????
		
		@Bean(destroyMethod = "close")
		@Scope("prototype")//prototype : ???????????????????????? ????????? (getBean()) ?????? ???????????? ??? ??????????????? ??????
		public RestHighLevelClient restHighLevelClient(){
		      return new RestHighLevelClient(RestClient.builder(new HttpHost("0.0.0.0",9200,"http")));
		}
		
		
		//index ????????? mapping??? ????????? ???????????? ?????????
		@GetMapping(value = "/create")
		public String ping() throws IOException {
			CreateIndexRequest request = new CreateIndexRequest("news_keyword");
			request.settings(Settings.builder()
					.put("index.number_of_shards", 1)
					.put("index.number_of_replicas", 2)
					);
			request.mapping( 	
			        "{\n" +
			                "  \"properties\": {\n" +
			                "    \"word\": {\n" +
			                "      \"type\": \"text\",\n" +
			                "        \"fields\": {\n"+
			                "        	\"keyword\": {\n"+
			                "			\"type\": \"keyword\",\n"+
			                "			 \"ignore_above\": 256 \n"+
			                "    }\n" +
			                "  }\n" +
			                "  }\n" +
			                "  }\n" +
			                "}", 
			        XContentType.JSON);
			
			
			CreateIndexResponse indexResponse = client.indices().create(request, RequestOptions.DEFAULT);
			return "created";
		}
		
		
		//index??? ???????????? ??????
		@GetMapping(value = "/upsert")
		public String upsert(String id) throws IOException {
			Map<String, Object> jsonMap = new HashMap<>();
			JSONObject obj = new JSONObject(id);
			jsonMap.put("word", obj.get("search"));
			System.out.println(obj.get("search"));
			IndexRequest request = new IndexRequest("news_keyword-2021.02.23").id(uuidran.toString()).source(jsonMap);
			IndexResponse indexResponse = client.index(request, RequestOptions.DEFAULT);
			return "success";
		}
		
		
		/*
		GET news_keyword-2021.02.21/_search
		{
	  		"size":0,
	  		"aggs": {
	    	"group_by_word": {
	      		"terms": {
	        "field": "word.keyword"
	      	}
	    	}
	  	}
		}
		 */
		
		
		@GetMapping(value = "searchcount")
	    public ResponseEntity searchcount() throws IOException {
			SearchRequest searchRequest = new SearchRequest("news_keyword-2021.02.23");
			System.out.println("searchcount");
			SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
			searchSourceBuilder.size(0);		
			TermsAggregationBuilder aggregation = AggregationBuilders.terms("group_by_word").field("word.keyword").size(10);
			searchSourceBuilder.aggregation(aggregation);
			searchRequest.source(searchSourceBuilder);
			SearchResponse searchResponse = client.search(searchRequest, RequestOptions.DEFAULT);
	        JSONObject json = new JSONObject(searchResponse.toString());
	        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
	    }
		
		
		
		//fuzzyQuery ?????? ????????? 
		//???????????? ?????? ?????? ?????? ????????? ???????????? ????????? ????????? ?????? ?????? ??? ??????. fuzziness ????????? ???????????? ????????? ????????????.
		//GetMapping??? RequestMapping(value="", method = RequestMethod.Get)??? ?????? ?????? ?????? ????????? 4.3?????? ????????? ???????????????
		@GetMapping(value = "searchfuzzy")
	    public ResponseEntity searchfuzzy(String id) throws IOException {
	        QueryBuilder matchQueryBuilder = QueryBuilders.fuzzyQuery("news_elastic", id);
	        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
	        sourceBuilder.query(matchQueryBuilder);
	        sourceBuilder.from(0);
	        sourceBuilder.size(50);
	        SearchRequest searchRequest = new SearchRequest("news");
	        SearchResponse searchResponse = client.search(searchRequest,RequestOptions.DEFAULT);
	        JSONObject json = new JSONObject(searchResponse.toString());
	        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
	    }

		
		@GetMapping(value = "searchprefix")
	    public ResponseEntity searchprefix(String id) throws IOException {
	        QueryBuilder matchQueryBuilder = QueryBuilders.prefixQuery("news_elastic", id);
	        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
	        sourceBuilder.query(matchQueryBuilder);
	        sourceBuilder.from(0);
	        sourceBuilder.size(10);
	        SearchRequest searchRequest = new SearchRequest("news");
	        searchRequest.source(sourceBuilder);
	        SearchResponse searchResponse = client.search(searchRequest,RequestOptions.DEFAULT);
	        System.out.println(searchResponse);
	        if(searchResponse.getHits().getTotalHits().toString().equals("0 hits")) {
	        	SearchResponse searchResponse02 = searchRepeat(id);
		        JSONObject json = new JSONObject(searchResponse02.toString());
		        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
	        }
	        JSONObject json = new JSONObject(searchResponse.toString());
	        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
	    }


		//match_pharse ??????
		//match ????????? ?????? ????????? ??????????????? ?????? bool-should ????????? ????????????. 
		//?????????????????? ?????? ????????? ????????? ???(phrase)??? ???????????? ????????? match_phrase ????????? ????????????.
		//???) ?????? ????????? ????????? ????????? ????????? ????????????.
		@GetMapping(value = "searchmatchphrase")
	    public ResponseEntity searchmatchphrase(String id) throws IOException {
			System.out.println(id);
	        QueryBuilder matchQueryBuilder = QueryBuilders.matchPhrasePrefixQuery("news_elastic", id);
	        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
	        sourceBuilder.query(matchQueryBuilder);
	        sourceBuilder.from(0);
	        sourceBuilder.size(10);
//	        sourceBuilder.sort(new ScoreSortBuilder().order(SortOrder.DESC)); 
//          sourceBuilder.sort(new FieldSortBuilder("news_date").order(SortOrder.DESC));  
	        SearchRequest searchRequest = new SearchRequest("news");
	        searchRequest.source(sourceBuilder);
	        SearchResponse searchResponse = client.search(searchRequest,RequestOptions.DEFAULT);
	        if(searchResponse.getHits().getTotalHits().toString().equals("0 hits")) {
	        	SearchResponse searchResponse02 = searchRepeat(id);
		        JSONObject json = new JSONObject(searchResponse02.toString());
		        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
	        }

	        JSONObject json = new JSONObject(searchResponse.toString());
	        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
	    }
		
		//?????? ?????? ????????? ???????????? ????????? ??????
	    public SearchResponse searchRepeat(String id) throws IOException {
	    	String id2 = id.replaceAll(" ", "");
	    	System.out.println("searchRepeat"+id2);
	        QueryBuilder matchQueryBuilder = QueryBuilders.matchPhrasePrefixQuery("news_elastic", id2);
	        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
	        sourceBuilder.query(matchQueryBuilder);
	        sourceBuilder.from(0);
	        sourceBuilder.size(10); 
	        SearchRequest searchRequest = new SearchRequest("news");
	        searchRequest.source(sourceBuilder);
	        SearchResponse searchResponse = client.search(searchRequest,RequestOptions.DEFAULT);
	        System.out.println("searchRepeat" +searchResponse.getHits().getTotalHits());
	        return searchResponse;
	    }
		
	    public SearchResponse searchRepeatSort(String id) throws IOException {
	    	String id2 = id.replaceAll(" ", "");
	    	System.out.println("searchRepeat"+id2);
	        QueryBuilder matchQueryBuilder = QueryBuilders.matchPhrasePrefixQuery("news_elastic", id2);
	        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
	        sourceBuilder.query(matchQueryBuilder);
	        sourceBuilder.from(0);
	        sourceBuilder.size(10);
	        sourceBuilder.sort(new FieldSortBuilder("news_date").order(SortOrder.DESC));
	        SearchRequest searchRequest = new SearchRequest("news");
	        searchRequest.source(sourceBuilder);
	        SearchResponse searchResponse = client.search(searchRequest,RequestOptions.DEFAULT);
	        System.out.println("searchRepeat" +searchResponse.getHits().getTotalHits());
	        return searchResponse;
	    }

	    
		//?????????
		@GetMapping(value = "searchmatchphrasesort")
	    public ResponseEntity searchmatchphrasesort(String id) throws IOException {
	        QueryBuilder matchQueryBuilder = QueryBuilders.matchPhrasePrefixQuery("news_elastic", id);
	        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
	        sourceBuilder.query(matchQueryBuilder);
	        sourceBuilder.from(0);
	        sourceBuilder.size(10);
            sourceBuilder.sort(new FieldSortBuilder("news_date").order(SortOrder.DESC));  
	        SearchRequest searchRequest = new SearchRequest("news");
	        searchRequest.source(sourceBuilder);
	        SearchResponse searchResponse = client.search(searchRequest,RequestOptions.DEFAULT);
	        if(searchResponse.getHits().getTotalHits().toString().equals("0 hits")) {
	        	SearchResponse searchResponse02 = searchRepeatSort(id);
		        JSONObject json = new JSONObject(searchResponse02.toString());
		        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
	        }
	        JSONObject json = new JSONObject(searchResponse.toString());
	        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
		}
		
		//????????? ?????? ?????? 9???
	    @GetMapping(value = "searchtodaynews")
	    public ResponseEntity searchtodaynews() throws IOException {
	        Calendar cal = Calendar.getInstance();
	        Date date = cal.getTime();
	        String dateString = new SimpleDateFormat("yyyy-MM-dd").format(date);
	        QueryBuilder matchQueryBuilder = QueryBuilders.matchAllQuery();
	        System.out.println(dateString);
	        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
	        sourceBuilder.query(matchQueryBuilder);
	        sourceBuilder.from(0);
	        sourceBuilder.size(9);
	        sourceBuilder.sort(new FieldSortBuilder("news_date").order(SortOrder.DESC));
	        System.out.println(sourceBuilder);
	        SearchRequest searchRequest = new SearchRequest("news");
	        searchRequest.source(sourceBuilder);
	        SearchResponse searchResponse = client.search(searchRequest,RequestOptions.DEFAULT);
	        JSONObject json = new JSONObject(searchResponse.toString());
	        System.out.println(json);
	        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
	    }
		
		
		@GetMapping(value = "searchgroupmatchphrase")
	    public ResponseEntity searchgroupmatchphrase(String id) throws IOException {
	        QueryBuilder matchQueryBuilder = QueryBuilders.matchPhrasePrefixQuery("news_group", id);
	        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
	        sourceBuilder.query(matchQueryBuilder);
	        sourceBuilder.from(0);
	        sourceBuilder.size(10);
	        sourceBuilder.sort(new FieldSortBuilder("news_date").order(SortOrder.DESC));
	        SearchRequest searchRequest = new SearchRequest("news");
	        searchRequest.source(sourceBuilder);
	        SearchResponse searchResponse = client.search(searchRequest,RequestOptions.DEFAULT);
	        if(searchResponse.getHits().getTotalHits().toString().equals("0 hits")) {
	        	SearchResponse searchResponse02 = searchRepeat(id);
		        JSONObject json = new JSONObject(searchResponse02.toString());
		        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
	        }
	        JSONObject json = new JSONObject(searchResponse.toString());
	        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
	    }
		
		//???, ??? ????????? ?????? ??????
		@GetMapping(value = "searchmatchphrasedate")
	    public ResponseEntity searchmatchphrasedate(String id, String id2) throws IOException {
	        QueryBuilder matchQueryBuilder = QueryBuilders.matchPhrasePrefixQuery("news_elastic", id);
	        Calendar cal = Calendar.getInstance();
	        Date date = cal.getTime();
	        String dateString = new SimpleDateFormat("yyyy-MM-dd").format(date);
	        String now = new SimpleDateFormat("yyyy-MM-dd").format(date);
	        int num = Integer.parseInt(id2);
	        switch(num) {
	        case 7 : 
	        	cal.add(Calendar.DATE, -7);
	        	date = cal.getTime();
	        	dateString = new SimpleDateFormat("yyyy-MM-dd").format(date);
	        	break;
	        	
	        case 30:
	        	cal.add(Calendar.MONTH, -1);
	        	date = cal.getTime();
	        	dateString = new SimpleDateFormat("yyyy-MM-dd").format(date);
	        	break;
	        	
	        case 90:
	        	cal.add(Calendar.MONTH, -3);
	        	date = cal.getTime();
	        	dateString = new SimpleDateFormat("yyyy-MM-dd").format(date);
	        	break;
	        	
	        case 180:
	        	cal.add(Calendar.MONTH, -6);
	        	date = cal.getTime();
	        	dateString = new SimpleDateFormat("yyyy-MM-dd").format(date);
	        	break;
	        	
	        case 365:
	        	cal.add(Calendar.YEAR, -1);
	        	date = cal.getTime();
	        	dateString = new SimpleDateFormat("yyyy-MM-dd").format(date);
	        	break;
	        }
	        
	        SearchRequest searchRequest = new SearchRequest("news");
	        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
	        sourceBuilder.query(matchQueryBuilder);
	        sourceBuilder.from(0);
	        sourceBuilder.size(10);
            sourceBuilder.postFilter(QueryBuilders.rangeQuery("news_date").from(dateString).to(now)); //gt 24
            sourceBuilder.sort(new FieldSortBuilder("news_date").order(SortOrder.DESC));
	        searchRequest.source(sourceBuilder);
	        SearchResponse searchResponse = client.search(searchRequest,RequestOptions.DEFAULT);
	        if(searchResponse.getHits().getTotalHits().toString().equals("0 hits")) {
	        	SearchResponse searchResponse02 = searchRepeatSort(id);
		        JSONObject json = new JSONObject(searchResponse02.toString());
		        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
	        }
	        JSONObject json = new JSONObject(searchResponse.toString());
	        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
		}
		
		
		@GetMapping(value = "searchworkdkeyword")
	    public ResponseEntity searchworkdkeyword(String id) throws IOException {
	        QueryBuilder matchQueryBuilder = QueryBuilders.prefixQuery("word", id);
	        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
	        sourceBuilder.query(matchQueryBuilder);
	        sourceBuilder.from(0);
	        sourceBuilder.size(10); 
	        SearchRequest searchRequest = new SearchRequest("news");
	        searchRequest.source(sourceBuilder);
	        SearchResponse searchResponse = client.search(searchRequest,RequestOptions.DEFAULT);
	        if(searchResponse.getHits().getTotalHits().toString().equals("0 hits")) {
	        	SearchResponse searchResponse02 = searchRepeat(id);
		        JSONObject json = new JSONObject(searchResponse02.toString());
		        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
	        }
	        JSONObject json = new JSONObject(searchResponse.toString());
	        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
	    }
		
		//????????? document??? ??????/??????/??????????????? BulkAPI??? ???????????????
		@GetMapping(value = "bulkrequest")
	    public BulkResponse bulkrequest() throws IOException {
			BulkRequest request = new BulkRequest(); 
			request.add(new IndexRequest("news_keyword").id(uuidran.toString().replace("-", ""))
			        .source(XContentType.JSON,"word", "???????????????"));
//			request.add(new IndexRequest("news").id("2")  
//			        .source(XContentType.JSON,"word", "???????????????"));
//			request.add(new IndexRequest("news").id("3")  
//			        .source(XContentType.JSON,"word", "????????????"));
//			request.add(new IndexRequest("news").id("4")  
//			        .source(XContentType.JSON,"word", "??????????????????"));
//			request.add(new IndexRequest("news").id("5")  
//			        .source(XContentType.JSON,"word", "????????????"));
//			request.add(new IndexRequest("news").id("6")  
//			        .source(XContentType.JSON,"word", "?????? ?????????"));
//			request.add(new IndexRequest("news").id("7")  
//			        .source(XContentType.JSON,"word", "?????? ?????????"));
//			request.add(new IndexRequest("news").id("8")  
//			        .source(XContentType.JSON,"word", "????????????"));
//			request.add(new IndexRequest("news").id("9")  
//			        .source(XContentType.JSON,"word", "????????????"));
//			request.add(new IndexRequest("news").id("10")  
//			        .source(XContentType.JSON,"word", "??????"));
//			request.add(new IndexRequest("news").id("11")  
//			        .source(XContentType.JSON,"word", "?????????"));
//			request.add(new IndexRequest("news").id("12")  
//			        .source(XContentType.JSON,"word", "??????"));
//			request.add(new IndexRequest("news").id("13")  
//			        .source(XContentType.JSON,"word", "??????"));
//			request.add(new IndexRequest("news").id("14")  
//			        .source(XContentType.JSON,"word", "????????????"));
//			request.add(new IndexRequest("news").id("15")  
//			        .source(XContentType.JSON,"word", "???????????????"));
//			request.add(new IndexRequest("news").id("16")  
//			        .source(XContentType.JSON,"word", "????????????"));
//			request.add(new IndexRequest("news").id("17")  
//			        .source(XContentType.JSON,"word", "????????????"));
//			request.add(new IndexRequest("news").id("18")  
//			        .source(XContentType.JSON,"word", "????????????"));
//			request.add(new IndexRequest("news").id("19")  
//			        .source(XContentType.JSON,"word", "????????????"));
//			request.add(new IndexRequest("news").id("20")  
//			        .source(XContentType.JSON,"word", "?????????"));
			BulkResponse bulkResponse = client.bulk(request, RequestOptions.DEFAULT);
			return bulkResponse;
		}
		
		@GetMapping(value = "searchboardmatchpharse")
	    public ResponseEntity searchboardmatchpharse(String id) throws IOException {
	        QueryBuilder matchQueryBuilder = QueryBuilders.matchPhrasePrefixQuery("board_search_content", id);
	        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
	        sourceBuilder.query(matchQueryBuilder);
	        sourceBuilder.from(0);
	        sourceBuilder.size(10);
//	        sourceBuilder.sort(new ScoreSortBuilder().order(SortOrder.DESC)); 
//          sourceBuilder.sort(new FieldSortBuilder("news_date").order(SortOrder.DESC));  
	        SearchRequest searchRequest = new SearchRequest("boards");
	        searchRequest.source(sourceBuilder);
	        SearchResponse searchResponse = client.search(searchRequest,RequestOptions.DEFAULT);
//	        if(searchResponse.getHits().getTotalHits().toString().equals("0 hits")) {
//	        	SearchResponse searchResponse02 = searchRepeat(id);
//		        JSONObject json = new JSONObject(searchResponse02.toString());
//		        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
//	        }

	        JSONObject json = new JSONObject(searchResponse.toString());
//	        System.out.println(searchRequest);
//	        System.out.println(sourceBuilder);
//	        System.out.println(searchResponse);
	        return new ResponseEntity<>(json.toMap(), HttpStatus.OK);
	    }
		

}
